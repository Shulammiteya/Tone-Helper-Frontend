/* eslint-disable linebreak-style */
import React from 'react';
import {
  Card,
  Text,
  Layout,
  Button,
} from '@ui-kitten/components';
import {
  Dimensions,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import Slider from '@react-native-community/slider';
import { Audio } from "expo-av";
import { Icon } from 'react-native-elements';
import { Theming } from '../../../services/theme.service';
import { RecordingComponent } from './recording.component';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const DISABLED_OPACITY = 0.5;

export default class RecordingScreen extends React.Component {

  static contextType = Theming.ThemeContext;

  constructor(props) {
    super(props);
    this.recording = null;
    this.sound = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      haveRecordingPermissions: true,
      isLoading: false,
      isPlaybackAllowed: false,
      muted: false,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isRecording: false,
      volume: 1.0,
    };
    //this.recordingSettings = Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY;
    this.recordingSettings = {
      android: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM, //Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,//RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
      },
    };
  }

  async componentDidMount() {
    const response = await Audio.getPermissionsAsync();
    if(response.status !== "granted")
      this._askForPermissions();
  }

  _askForPermissions = async () => {
    const response = await Audio.requestPermissionsAsync();
    this.setState({
      haveRecordingPermissions: response.status === "granted",
    });
  };

  _updateScreenForSoundStatus = (status) => {
    if (status.isLoaded) {
      this.setState({
        soundDuration: status.durationMillis ?? null,
        soundPosition: status.positionMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        muted: status.isMuted,
        volume: status.volume,
        isPlaybackAllowed: true,
      });
    } else {
      this.setState({
        soundDuration: null,
        soundPosition: null,
        isPlaybackAllowed: false,
      });
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _updateScreenForRecordingStatus = (status) => {
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      });
      if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }
    }
  };

  async _stopPlaybackAndBeginRecording() {
    this.setState({
      isLoading: true,
    });
    if (this.sound !== null) {
      await this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    if (this.recording !== null) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(this.recordingSettings);
    recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false,
    });
  }

  async _stopRecordingAndEnablePlayback() {
    this.setState({
      isLoading: true,
    });
    if (!this.recording) {
      return;
    }
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // On Android, calling stop before any data has been collected results in
      // an E_AUDIO_NODATA error. This means no audio data has been written to
      // the output file is invalid.
      if (error.code === "E_AUDIO_NODATA") {
        console.log(
          `Stop was called too quickly, no data has yet been received (${error.message})`
        );
      } else {
        console.log("STOP ERROR: ", error.code, error.name, error.message);
      }
      this.setState({
        isLoading: false,
      });
      return;
    }
    //const info = await FileSystem.getInfoAsync(this.recording.getURI() || "");
    //console.log(`FILE INFO: ${info}`); //${JSON.stringify(info)}`);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const { sound, status } = await this.recording.createNewLoadedSoundAsync(
      {
        isLooping: false,
        isMuted: this.state.muted,
        volume: this.state.volume,
      },
      this._updateScreenForSoundStatus
    );
    this.sound = sound;
    this.setState({
      isLoading: false,
    });
  }

  _onRecordPressed = () => {
    if (this.state.isRecording) {
      this._stopRecordingAndEnablePlayback();
    } else {
      this._stopPlaybackAndBeginRecording();
    }
  };

  _onPlayPausePressed = () => {
    if (this.sound != null) {
      if (this.state.isPlaying) {
        this.sound.pauseAsync();
      } else {
        this.sound.playAsync();
      }
    }
  };

  _onStopPressed = () => {
    if (this.sound != null) {
      this.sound.stopAsync();
    }
  };

  _onMutePressed = () => {
    if (this.sound != null) {
      this.sound.setIsMutedAsync(!this.state.muted);
    }
  };

  _onVolumeSliderValueChange = (value) => {
    if (this.sound != null) {
      this.sound.setVolumeAsync(value);
    }
  };

  _onSeekSliderValueChange = (value) => {
    if (this.sound != null && !this.isSeeking) {
      this.isSeeking = true;
      this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
      this.sound.pauseAsync();
    }
  };

  _onSeekSliderSlidingComplete = async (value) => {
    if (this.sound != null) {
      this.isSeeking = false;
      const seekPosition = value * (this.state.soundDuration || 0);
      if (this.shouldPlayAtEndOfSeek) {
        this.sound.playFromPositionAsync(seekPosition);
      } else {
        this.sound.setPositionAsync(seekPosition);
      }
    }
  };

  _getSeekSliderPosition() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      if(this.state.soundPosition / this.state.soundDuration === 1)
        this._onStopPressed();
      return this.state.soundPosition / this.state.soundDuration;
    }
    return 0;
  }

  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = (number) => {
      const string = number.toString();
      if (number < 10) {
        return "0" + string;
      }
      return string;
    };
    return padWithZero(minutes) + ":" + padWithZero(seconds);
  }

  _getPlaybackTimestamp() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return `${this._getMMSSFromMillis(this.state.soundPosition)}`;
    }
    return "";
  }

  _getPlaybackDuration() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return `${this._getMMSSFromMillis(this.state.soundDuration)}`;
    }
    return "";
  }

  _getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
    }
    return `${this._getMMSSFromMillis(0)}`;
  }

  render() {

    const themeContext = this.context;
    const backgroundColor = themeContext.isDarkMode()? '#5577aa' : '#aaccff';

    if(!this.state.haveRecordingPermissions) {
      return (
        <Layout style={styles.container} level='2'>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Card style={styles.noPermissionsCard}>
              <Text category="h6" style={styles.noPermissionsText1}>
                You must enable audio recording permissions in order to use this app.
              </Text>
              <Text appearance='hint' style={styles.noPermissionsText2}>
                請允許錄音權限才能繼續使用喔
              </Text>
              <Button
                status='info'
                appearance='outline'
                style={{margin:10, marginTop: 30, borderRadius: 20,}}
                onPress={this._askForPermissions}>
                  Activate
              </Button>
            </Card>
          </ScrollView>
        </Layout>
      );
    }

    return (
      <Layout style={styles.container} level='2'>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.halfScreenContainer,
              styles.recordingContainer,
              { opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0, },
            ]}
          >
            {
              this.state.isRecording
                ? ( <RecordingComponent
                  recording={this.recording}
                  _onRecordPressed={this._onRecordPressed}
                  isLoading={this.state.isLoading}
                /> )
                : ( <Icon
                  raised={!themeContext.isDarkMode()}
                  reverse={themeContext.isDarkMode()}
                  name="microphone"
                  type="font-awesome"
                  color={backgroundColor}
                  size={46}
                  onPress={this._onRecordPressed}
                  disabled={this.state.isLoading}
                /> )
            }
            <Text style={ {opacity: this.state.isRecording ? DISABLED_OPACITY : 0} }>
              {this._getRecordingTimestamp()}
            </Text>
          </View>
          <View
            style={[
              styles.halfScreenContainer,
              {
                opacity:
                  !this.state.isPlaybackAllowed || this.state.isLoading ? DISABLED_OPACITY : 1.0,
              },
            ]}
          >
            <View style={styles.playbackContainer}>
              <Text category='label' >
                {this._getPlaybackTimestamp()}
              </Text>
              <Slider
                style={styles.playbackSlider}
                value={this._getSeekSliderPosition()}
                onValueChange={this._onSeekSliderValueChange}
                onSlidingComplete={this._onSeekSliderSlidingComplete}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                thumbTintColor="#aaccff"
                minimumTrackTintColor="#aabbdd"
                maximumTrackTintColor="#bbccdd"
              />
              <Text category='label' >
                {this._getPlaybackDuration()}
              </Text>
            </View>
            <View style={styles.buttonsContainerBase}>
              <Icon
                  raised={!themeContext.isDarkMode()}
                  reverse={themeContext.isDarkMode()}
                  name={ this.state.muted ? 'volume-off' : 'volume-up' }
                  type="font-awesome"
                  color={backgroundColor}
                  onPress={this._onMutePressed}
                  disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              />
              <Slider
                style={styles.volumeSlider}
                value={1}
                onValueChange={this._onVolumeSliderValueChange}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                thumbTintColor="#aaccff"
                minimumTrackTintColor="#aabbdd"
                maximumTrackTintColor="#bbccdd"
              />
              <Icon
                raised={!themeContext.isDarkMode()}
                reverse={themeContext.isDarkMode()}
                name={ this.state.isPlaying ? 'pause' : 'play' }
                type="font-awesome"
                color={backgroundColor}
                size={35}
                onPress={this._onPlayPausePressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              />
              <Icon
                raised={!themeContext.isDarkMode()}
                reverse={themeContext.isDarkMode()}
                name="stop"
                type="font-awesome"
                color={backgroundColor}
                onPress={this._onStopPressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              />
            </View>
          </View>
        </ScrollView>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noPermissionsCard: {
    borderWidth: 4,
    borderRadius: 20,
    margin: DEVICE_WIDTH / 9,
    marginVertical: DEVICE_HEIGHT / 10,
  },
  noPermissionsText1: {
    marginVertical:15,
    textAlign: "center",
  },
  noPermissionsText2: {
    textAlign: "center",
  },
  halfScreenContainer: {
    flex: 1,
    height: DEVICE_HEIGHT / 3,
    paddingHorizontal: DEVICE_WIDTH / 50,
  },
  recordingContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: DEVICE_HEIGHT / 16,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DEVICE_WIDTH / 40,
  },
  playbackSlider: {
    flex: 1
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  volumeSlider: {
    flex: 1,
  },
});
