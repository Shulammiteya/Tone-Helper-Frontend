import React from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox } from '@ui-kitten/components';
import { useSelector, useDispatch } from 'react-redux';
import { addSelectedData, removeSelectedData } from '../../../redux/actions';

export const RenderItemCheckBox = ({ item }) => {

  const { selectedData } = useSelector(state => state.dataReducer);
  const dispatch = useDispatch();

  return (
    <CheckBox
      checked={selectedData.includes(item)}
      style={styles.listCheckBox}
      status={selectedData.includes(item) ? 'control' : 'basic'}
      onChange={(checked) => {
        if(checked)
          dispatch(addSelectedData(item));
        else
          dispatch(removeSelectedData(item));
      }}
    />
  );
}

const styles = StyleSheet.create({
  listCheckBox: {
    paddingHorizontal: 4,
  },
});
