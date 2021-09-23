import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import RenderItem from './tuning.renderItem';
import {
  Icon,
  Text,
  Layout,
  TopNavigation,
  TopNavigationAction
} from '@ui-kitten/components';
import axios from 'axios';
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';
import { Icon as IconElements } from 'react-native-elements';

import { SafeAreaLayout } from '../../../components/safe-area-layout.component';
import { Theming } from '../../../services/theme.service';
import { BASE_URL } from '../../../config';
import Scrubber from './scrubber'

var Buffer = require('buffer/').Buffer;

const GAP = 34
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const DISABLED_OPACITY = 0.5;
const displayNoteNum = Math.round(DEVICE_HEIGHT / 5 * 3 / GAP);

const noteAndFrequence = {
  'C6': 1046.5,
  'B5': 987.77,
  'A5': 880.00,
  'G5': 783.99,
  'F5': 698.46,
  'E5': 659.26,
  'D5': 587.33,
  'C5': 523.25,
  'B4': 493.88,
  'A4': 440.00,
  'G4': 392.00,
  'F4': 349.23,
  'E4': 329.63,
  'D4': 293.66,
  'C4': 261.63,
  'B3': 246.94,
  'A3': 220.00,
  'G3': 196.00,
  'F3': 174.61,
  'E3': 164.81,
  'D3': 146.83,
  'C3': 130.81,
  'B2': 123.47,
  'A2': 110.00,
  'G2': 97.999,
  'F2': 87.307,
  'E2': 82.407,
}

const frequenceTable = [
  1046.5,
  0,

  987.77,
  932.33,
  
  880.00,
  830.61,
  
  783.99,
  739.99,

  698.46,
  0,

  659.26,
  622.25,

  587.33,
  554.37,

  523.25,
  0,
  
  493.88,
  466.16,

  440.00,
  415.30,

  392.00,
  369.66,

  349.23,
  0,

  329.63,
  311.13,

  293.66,
  277.18,

  261.63,
  0,

  246.94,
  233.08,

  220.00,
  207.65,

  196.00,
  185.00,

  174.61,
  0,

  164.81,
  155.56,

  146.83,
  138.59,

  130.81,
  0,

  123.47,
  116.54,

  110.00,
  103.83,

  97.999,
  92.499,

  87.307,
  0,

  82.407,
]

const noteTable = [
  'C6',
  'B5',
  'A5',
  'G5',
  'F5',
  'E5',
  'D5',
  'C5',
  'B4',
  'A4',
  'G4',
  'F4',
  'E4',
  'D4',
  'C4',
  'B3',
  'A3',
  'G3',
  'F3',
  'E3',
  'D3',
  'C3',
  'B2',
  'A2',
  'G2',
  'F2',
  'E2',
]

export default class TuningScreen extends React.Component {

  static contextType = Theming.LanguageContext;

  constructor(props) {
    super(props);
    this.sound = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.boxHeight = (Math.round(DEVICE_HEIGHT / 5 * 3 / GAP) * GAP);
    this.boxGapWidth = this.props.route.params.data.wordInfo.length > 0 ? this.props.route.params.data.wordInfo.length * 2 : 0;
    this.boxWidth = this.props.route.params.data.wordInfo.length > 0 ?
      this.props.route.params.data.wordInfo[this.props.route.params.data.wordInfo.length - 1].end / 200 : 0;
    this.originalBase64Str;
    this.f0Array = [];
    this.tuneBtn = this.props.route.params.data.wordInfo.length > 0 ? false : true;
    this.state = {
      isLoading: false,
      isPlaybackAllowed: false,
      soundPosition: null,
      soundDuration: null,
      shouldPlay: false,
      isPlaying: false,
      upBtn: true,
      downBtn: true,
      zoomInBtn: true,
      zoomOutBtn: true,
      startNoteNum: 17,
      boxMultiple: 1,
    };
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
    const { data } = this.props.route.params;
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
      {uri: data.uri},
      {
        isLooping: false,
        isMuted: false,
        volume: 1.0,
      },
      this._updateScreenForSoundStatus
    );

    if(!this.originalBase64Str && data.wordInfo.length > 0) {
      this.originalBase64Str = await FileSystem.readAsStringAsync(data.originalUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      for(let i = 0; i < data.wordInfo[data.wordInfo.length - 1].f0End; i++)
        this.f0Array[i] = 0;
      for(let i = 0; i < data.wordInfo.length; i++) {
        this.setItemNote(data.wordInfo[i].f0Start, data.wordInfo[i].f0End, 4);
      }
    }

    this.sound = sound;
    this.setState({
      isLoading: false,
    });
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

  renderDrawerAction = () => (
    <TopNavigationAction
      icon={(props) => <Icon {...props} name='arrow-ios-back'/>}
      onPress={this.props.navigation.goBack}
    />
  );

  setItemNote = (start, end, noteIndex) => {

    let note = noteTable[this.state.startNoteNum];
    let startF0 = noteAndFrequence[note];
    let f0 = 0;
    for(let i = 0; i < frequenceTable.length; i++) {
      if(frequenceTable[i] === startF0 && i + noteIndex < frequenceTable.length) {
        f0 = frequenceTable[i + noteIndex];
        break;
      }
    }

    if(f0 === 0) {
      alert('沒有這個音喔');
      return;
    }

    for(let i = start; i < end; i++) {
      this.f0Array[i] = f0;
    }
    //console.log(f0)
  }

  startTune = async () => {

    const { data, } = this.props.route.params;

    this.setState({
      isLoading: true,
    });

    let formData = new FormData();
    formData.append('f0', JSON.stringify(this.f0Array))
    //formData.append("audio", this.originalBase64Str);
    formData.append("audio", {
      uri: data.originalUri,
      name: `audio`,
      type: `audio/m4a`
    });
    
    console.log("fetch")
    await axios
      .request({
        url: `${BASE_URL}/tune`,
        method: "POST",
        data: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data"
        }
      })
      .then(result => {
        let bufferRes = new Buffer(result.data , 'base64');
        let base64Str = new Buffer(bufferRes).toString('base64');
        try {
          FileSystem.writeAsStringAsync(
            data.uri,
            base64Str, {
              encoding: FileSystem.EncodingType.Base64,
            });
        } catch (error) {
          console.warn(error);
        }
      })
      .catch(error => {
        alert("網路連線錯誤或伺服器忙碌");
        console.log(error);
      });
    console.log('fetch end')
    this.componentDidMount();
  }

  /*calculateTop = (f0) => {
    let top = 26;
    for(let i = 0; i < noteFrequenceTable.length - 1; i++) {
      if(f0 >= noteFrequenceTable[i] && f0 < noteFrequenceTable[i + 1]) {
        top = i + Math.round((f0 - noteFrequenceTable[i]) / (noteFrequenceTable[i + 1] - noteFrequenceTable[i]));
        break;
      }
    }
    //console.log(f0)
    //console.log(top)
    return top;
  }*/

  renderItem = ( item, key ) => {
    return <RenderItem
      style={{marginLeft: key === 0? DEVICE_WIDTH / 7 : 0}}
      key={key}
      top={1 + GAP * 2}// (Math.floor(displayNoteNum / 2) - 1)}//946 - 34 * this.calculateTop(item.f0)}
      width={Math.floor((item.end - item.start) / 200) * this.state.boxMultiple}
      start={item.start}
      end={item.end}
      word={item.word}
      f0Start={item.f0Start}
      f0End={item.f0End}
      setItemNote={this.setItemNote}
      startNoteNum={this.state.startNoteNum}
      displayNoteNum={displayNoteNum}
    />
  };

  renderNote = (item, key) => (
    <Text key={key} appearance="hint" style={styles.noteStyle}>{item}</Text>
  )

  shouldComponentUpdate(nextState) {
    if(this.state.upBtn !== nextState.upBtn || this.state.downBtn !== nextState.downBtn
       || this.state.zoomInBtn !== nextState.zoomInBtn || this.state.zoomOutBtn !== nextState.zoomOutBtn )
      return true;
    else
      return false;
  }

  render() {

    const languageContext = this.context;
    const { data } = this.props.route.params;

    return (
      <SafeAreaLayout
        style={styles.safeArea}
        insets='top'
      >
        <TopNavigation
          title={languageContext.isChinese()? '調音' : 'Tuning'}
          accessoryLeft={() => this.renderDrawerAction()}
          alignment='center'
        />
        <Layout
          style={[
            styles.tuneScreenContainer,
            { opacity: !this.state.isPlaybackAllowed || this.state.isLoading ? DISABLED_OPACITY : 1.0, },
          ]}
        >
          <ScrollView horizontal={true} >
            <Scrubber
              boxWidth={this.state.boxMultiple * this.boxWidth + this.boxGapWidth}
              totalDuration={1}
              scrubberColor="#aaaaff"
              scrubberPosition={this._getSeekSliderPosition()}
              onScrubbingComplete={this._onSeekSliderSlidingComplete}
              onScrubbingValueChange={this._onSeekSliderValueChange}
            />
            {
              data.wordInfo.map(this.renderItem)
            }
          </ScrollView>
          <View style={styles.allNoteStyle}>
            {
              noteTable.slice(this.state.startNoteNum, this.state.startNoteNum + displayNoteNum).map(this.renderNote)
            }
          </View>
          <View style={styles.startTuneBtn}>
            <IconElements
              raised
              reverse
              name='check'
              type="entypo"
              color='#ff8f00'
              size={20}
              onPress={this.startTune}
              disabled={ this.tuneBtn || !this.state.isPlaybackAllowed || this.state.isLoading}
            />
          </View>
        </Layout>
        <View
          style={[
            styles.buttonsContainerBase,
            { opacity: !this.state.isPlaybackAllowed || this.state.isLoading ? DISABLED_OPACITY : 1.0, },
          ]}
        >
          <Icon
            fill='#aaccff'
            height={DEVICE_WIDTH / 15}
            width={DEVICE_WIDTH / 15}
            name='arrow-circle-up'
            onPress={() => {
              if(!this.state.isPlaying) {
                if(this.state.startNoteNum == 1) {
                  this.setState({startNoteNum: 0});
                  this.setState({upBtn: false});
                }
                else if(this.state.startNoteNum > 0) {
                  this.setState({startNoteNum: this.state.startNoteNum - 1});
                  if(!this.state.downBtn)
                    this.setState({downBtn: true});
                }
              }
            }}
            style={{ opacity: !this.state.upBtn || this.state.isPlaying ? DISABLED_OPACITY : 1.0 }}
          />
          <Icon
            fill='#aaccff'
            height={DEVICE_WIDTH / 15}
            width={DEVICE_WIDTH / 15}
            name='arrow-circle-down'
            onPress={() => {
              if(!this.state.isPlaying) {
                if(this.state.startNoteNum + displayNoteNum == noteTable.length - 1) {
                  this.setState({startNoteNum: this.state.startNoteNum + 1});
                  this.setState({downBtn: false});
                }
                else if(this.state.startNoteNum + displayNoteNum < noteTable.length) {
                  this.setState({startNoteNum: this.state.startNoteNum + 1});
                  if(!this.state.upBtn)
                    this.setState({upBtn: true});
                }
              }
            }}
            style={{ opacity: !this.state.downBtn || this.state.isPlaying ? DISABLED_OPACITY : 1.0 }}
          />
          <IconElements
            raised
            reverse
            name={this.state.isPlaying ? 'pause' : 'play'}
            type="font-awesome"
            color='#aaccff'
            size={20}
            onPress={this._onPlayPausePressed}
            disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
          />
          <Icon
            fill='#aaccff'
            height={DEVICE_WIDTH / 15}
            width={DEVICE_WIDTH / 15}
            name='plus-circle'
            onPress={() => {
              if(!this.state.isPlaying) {
                if(this.state.boxMultiple < 1.6) {
                  this.setState({boxMultiple: this.state.boxMultiple + 0.1});
                  if(!this.state.zoomOutBtn)
                    this.setState({zoomOutBtn: true});
                }
                else if(this.state.zoomInBtn) {
                  this.setState({boxMultiple: this.state.boxMultiple + 0.1});
                  this.setState({zoomInBtn: false});
                }
              }
            }}
            style={{ opacity: !this.state.zoomInBtn || this.state.isPlaying ? DISABLED_OPACITY : 1.0 }}
          />
          <Icon
            fill='#aaccff'
            height={DEVICE_WIDTH / 15}
            width={DEVICE_WIDTH / 15}
            name='minus-circle'
            onPress={() => {
              if(!this.state.isPlaying) {
                if(this.state.boxMultiple > 0.4) {
                  this.setState({boxMultiple: this.state.boxMultiple - 0.1});
                  if(!this.state.zoomInBtn)
                    this.setState({zoomInBtn: true});
                }
                else if(this.state.zoomOutBtn) {
                  this.setState({boxMultiple: this.state.boxMultiple - 0.1});
                  this.setState({zoomOutBtn: false});
                }
              }
            }}
            style={{ opacity: !this.state.zoomOutBtn || this.state.isPlaying ? DISABLED_OPACITY : 1.0 }}
          />
        </View>
      </SafeAreaLayout>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  startTuneBtn: {
    position: "absolute",
    top: DEVICE_HEIGHT / -25,
    right: DEVICE_WIDTH / 50,
    alignSelf: "flex-end",
  },
  tuneScreenContainer: {
    height: displayNoteNum * GAP + 20,
  },
  buttonsContainerBase: {
    flex: 1,
    height: DEVICE_HEIGHT - displayNoteNum * GAP - 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-evenly',
  },
  allNoteStyle: {
    flex: 1,
    marginVertical: DEVICE_HEIGHT / 30,
    marginHorizontal: DEVICE_WIDTH / 15,
    position: 'absolute',
    alignSelf: 'flex-start',
  },
  noteStyle: {
    height: GAP,
    textAlignVertical: 'center',
  },
});
