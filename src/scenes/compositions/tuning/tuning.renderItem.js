/* eslint-disable linebreak-style */
import React from 'react';
import {
  StyleSheet,
  View,
  PanResponder,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import {
  Divider,
} from '@ui-kitten/components';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const GAP = 34;

export default class RenderItem extends React.Component {
    
  constructor(props) {
    super(props);
    this.pan = new Animated.ValueXY({x: 0, y: this.props.top});
    
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        this.pan.setOffset(this.pan.__getValue());
      },
      onPanResponderMove: (e, gesture) => {
        this.pan.setValue({ x: 0, y: Math.round(gesture.dy / 17) * 17 });
        /*Animated.event(
          [null, {dy: this.pan.y}],
          {useNativeDriver: false},
        ),*/
      },
      onPanResponderRelease: (e, gesture) => {   
        let noteIndex = Math.round(this.pan.y.__getValue() / 17);
        if(noteIndex < 0) {
          this.pan.setOffset({x: 0, y: 1 + noteIndex * 17});
          Animated.spring(
            this.pan,
            {
              toValue: {x: 0, y: noteIndex * -17},
              useNativeDriver: false,
            }
          ).start();
        }
        else if(noteIndex > (this.props.displayNoteNum - 1) * 2) {
          this.pan.setOffset({x: 0, y: 1 + noteIndex * 17});
          Animated.spring(
            this.pan,
            {
              toValue: {x: 0, y: (this.props.displayNoteNum - 1) * 34 - noteIndex * 17},
              useNativeDriver: false,
            }
          ).start();
        }
        else {
          this.pan.setOffset({x: 0, y: 1});
          this.pan.setValue({ x: 0, y: noteIndex * 17 });
        }
        this.props.setItemNote(this.props.f0Start, this.props.f0End, noteIndex);
        //this.props.setDragging(false);
      }
    });
  }

  shouldComponentUpdate(nextProps) {
    const { startNoteNum, width } = this.props;
    if(width !== nextProps.width)
      return true;
    if(startNoteNum !== nextProps.startNoteNum) {
      let direction = startNoteNum - nextProps.startNoteNum;
      let position = this.pan.y.__getValue() + 34 * direction;
      if(direction < 0 && this.pan.y.__getValue() < 7)
        position -= 500;
      else if(direction > 0 && this.pan.y.__getValue() < -400)
        position += 500;
      this.pan.setOffset({x: 0, y: 0});
      this.pan.setValue({ x: 0, y: position });
    }
    return false;
  }
  
  render() {
    const { width, displayNoteNum } = this.props;

    let dividerArray = [];
    for(let i = 1; i < displayNoteNum; i++) {
      dividerArray[i] = i;
    }

    return (
      <View
        style={[
          this.props.style,
          {
            width: width, 
            marginVertical: DEVICE_HEIGHT / 30,
          },
        ]}
      >
        {
          dividerArray.map((key) => 
            <Divider key={key} style={[styles.divider, {top: GAP * key, width: width}]}/>
          )
        }
        <Animated.View
          {...this.panResponder.panHandlers}
          style={[
              this.pan.getLayout(),
              styles.box,
              {
                width: this.props.width,
                //opacity: this.state.opacity,
                /*transform: [{translateY:Animated.add(this.props.top, this.state.pan.y)}]*/
              }
          ]}
        >
          <Text style={styles.text} >
            {this.props.word}
          </Text>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  divider: {
    position: 'absolute',
  },
  box: {
    backgroundColor: "#fff2cc",
    height: GAP - 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',//"#f8c1cc",
  },
  text: {
    textAlign: 'center',
    //textAlignVertical: 'center',
    paddingTop: (GAP - 1) / 5,
  },
});
