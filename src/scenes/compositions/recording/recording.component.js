import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Icon } from '@ui-kitten/components';
import { useDispatch } from 'react-redux';
import { addSemiFinishedData } from '../../../redux/actions';

const { height: DEVICE_HEIGHT } = Dimensions.get("window");

export const RecordingComponent = ({ recording, _onRecordPressed, isLoading }) => {

  const dispatch = useDispatch();

  const pulseIconRef = React.useRef();

  React.useEffect(() => {
    pulseIconRef.current.startAnimation();
    return () => {
      dispatch(addSemiFinishedData({uri: recording._uri}));
    };
  }, []);

  return (
    <Icon
      ref={pulseIconRef}
      animationConfig={{ cycles: Infinity }}
      animation='pulse'
      style={styles.icon}
      fill='#e75577'
      height={55}
      width={55}
      name='mic'
      onPress={_onRecordPressed}
      disabled={isLoading}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingTop: DEVICE_HEIGHT / 5,
  },
});
