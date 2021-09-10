import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  View,
} from 'react-native';
import {
  Text,
  Icon,
  Layout,
} from '@ui-kitten/components';

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
    const { item, index, setItemToPlay } = this.props; 

    return item.uri ? (
      <Layout>
        <TouchableOpacity onPress={() => setItemToPlay(item.uri, index)} style={styles.listItem}>
          <View style={styles.listAudioInfo}>
            <Text style={styles.listAudioName} status={isItemPlaying? 'primary': 'info'} category='h6'>
              {item.name}
            </Text>
            <Text category='label' appearance='hint' status={isItemPlaying ? 'primary' : ''}>
              {item.description}
            </Text>
          </View>
          <Icon
            ref={this.pulseIconRef}
            animation='pulse'
            fill='#77aaff'//'#ccccee'
            height={DEVICE_WIDTH / 12}
            width={DEVICE_WIDTH / 12}
            name={isItemPlaying? 'pause-circle' : 'play-circle-outline'}
            style={styles.listIcon}
          />
        </TouchableOpacity>
      </Layout>
    ) : null;
  }
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: DEVICE_HEIGHT / 32,
  },
  listAudioInfo: {
    justifyContent: 'center',
  },
  listAudioName: {
    paddingBottom: DEVICE_HEIGHT / 80,
    fontSize: DEVICE_WIDTH / 20,
  },
  listIcon: {
    paddingVertical: DEVICE_HEIGHT / 23,
  },
});
