/* eslint-disable linebreak-style */
import React from 'react';
import {
  Text,
  Layout,
} from '@ui-kitten/components';
import {
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
import Slider from '@react-native-community/slider';
import { Audio } from "expo-av";
import { Icon, Badge } from 'react-native-elements';
import { Theming } from '../services/theme.service';

const { height: DEVICE_HEIGHT } = Dimensions.get("window");

export default class PlayerComponent extends React.Component {

  static contextType = Theming.ThemeContext;

  constructor(props) {
    super(props);
    this.sound = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      isLoading: false,
      isPlaybackAllowed: false,
      soundPosition: null,
      soundDuration: null,
      shouldPlay: false,
      isPlaying: false,
    };
  }

  async shouldComponentUpdate(nextProps, nextState) {

    if(this.props.uri !== nextProps.uri) {
      if (this.sound !== null) {
        await this.sound.unloadAsync();
        this.sound.setOnPlaybackStatusUpdate(null);
        this.sound = null;
      }
      this.componentDidMount();
    }
    
    return false;
  }

  _updateScreenForSoundStatus = (status) => {
    if (status.isLoaded) {
      this.setState({
        soundDuration: status.durationMillis ?? null,
        soundPosition: status.positionMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
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

  async componentDidMount() {
    this.setState({
      isLoading: true,
    });
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
    const { sound } = await Audio.Sound.createAsync(
      {uri: this.props.uri},
      {
        isLooping: false,
        isMuted: false,
        volume: 1.0,
      },
      this._updateScreenForSoundStatus
    );

    this.sound = sound;
    this.setState({
      isLoading: false,
    });
    this._onPlayPausePressed();
  }

  componentWillUnmount() {
    this.isSeeking = false;
    if (this.sound !== null) {
      this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
  }

  _onPlayPausePressed = () => {
    if (this.sound != null) {
      if (this.state.isPlaying) {
        this.sound.pauseAsync();
      } else {
        this.sound.playAsync();
      }
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
        this.sound.stopAsync();
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

  render() {

    const themeContext = this.context;
    const backgroundColor = themeContext.isDarkMode()? '#5577aa' : '#aaccff';

    return (
      <Layout style={styles.playbackContainer} level='3'>
        <Badge
          status='primary'
          value='X'
          containerStyle={styles.badge}
          onPress={() => this.props.setItemToPlay('')}
        />
        <View style={styles.playbackSliderAndTimestamp}>
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
          <View style={styles.timestamp}>
            <Text category='label' appearance='hint' size='tiny'>
              {this._getPlaybackTimestamp()}
            </Text>
            <Text category='label' appearance='hint' size='tiny'>
              {this._getPlaybackDuration()}
            </Text>
          </View>
        </View>
        <Icon
          raised={!themeContext.isDarkMode()}
          reverse={themeContext.isDarkMode()}
          name={this.state.isPlaying ? 'pause' : 'play'}
          type="font-awesome"
          color={backgroundColor}
          size={20}
          onPress={this._onPlayPausePressed}
          disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
        />
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  playbackContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: DEVICE_HEIGHT / 30,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: 66,
  },
  playbackSliderAndTimestamp: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  timestamp: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
});
