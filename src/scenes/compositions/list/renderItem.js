import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Text,
  Icon,
  Layout,
} from '@ui-kitten/components';
import { RenderItemCheckBox } from './renderItem-checkbox'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");

export default class RenderItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isItemPlaying: false,
    };
    this.pulseIconRef = React.createRef();
  }

  async shouldComponentUpdate(nextProps, nextState) {
    const {
      isItemPlaying,
    } = this.state;
    const {
      item,
      playingDataUri,
    } = this.props;
    if(playingDataUri !== nextProps.playingDataUri) {
      if(item.uri === nextProps.playingDataUri) {
        this.setState({ isItemPlaying: true });
        this.pulseIconRef.current.startAnimation();
      }
      else if(isItemPlaying) {
        this.setState({ isItemPlaying: false });
        this.pulseIconRef.current.stopAnimation();
      }
    }
    return false;
  }

  render() {
    const { isItemPlaying } = this.state;
    const { item, index, navigation, setItemToPlay } = this.props; 

    return item.uri ? (
      <Layout style={styles.listItem}>
        <RenderItemCheckBox
          item={item}
        />
        <TouchableOpacity onPress={() => setItemToPlay(item.uri, index)} >
          {
            isItemPlaying ? (
              <Text category='p2' style = {[styles.listAudioName, {color: '#7799ff'}]} >
                {item.name}
              </Text>
            ) : (
              <Text category='p2' style = {styles.listAudioName} >
                {item.name}
              </Text>
            )
          }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={ () => {
            setItemToPlay('');
            navigation.navigate('TuningScreen', { data: item, });
          }}
        >
          <Icon
            ref={this.pulseIconRef}
            animationConfig={{ cycles: Infinity }}
            animation='pulse'
            style={styles.listNavigationBtn}
            fill={isItemPlaying? '#6688ff' : '#ccccee'}
            height={DEVICE_WIDTH / 15}
            width={DEVICE_WIDTH / 15}
            name='arrowhead-right-outline'
          />
        </TouchableOpacity>
      </Layout>
    ) : null;
  }
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //margin: 0.5,
    //borderRadius: 16,
    paddingHorizontal: DEVICE_WIDTH / 30,
  },
  listAudioName: {
    flex: 1,
    textAlign: 'center',
    //textAlignVertical: 'center',
    paddingTop: DEVICE_HEIGHT / 17,
    width: DEVICE_WIDTH / 2.3,
    fontSize: DEVICE_WIDTH / 28,
  },
  listNavigationBtn: {
    flex: 1,
    marginVertical: DEVICE_HEIGHT / 18,
  }
});
