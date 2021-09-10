import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { BASE_URL } from '../config';

// Define action types
export const types = {
  ADD_SEMI_FINISHED_DATA: 'ADD_SEMI_FINISHED_DATA',
  REMOVE_SEMI_FINISHED_DATA: 'REMOVE_SEMI_FINISHED_DATA',

  ADD_SELECTED_DATA: 'ADD_SELECTED_DATA',
  REMOVE_SELECTED_DATA: 'REMOVE_SELECTED_DATA',
  SELECT_ALL: 'SELECT_ALL',
  UNSELECT_ALL: 'UNSELECT_ALL',

  ADD_FINISHED_DATA: 'ADD_FINISHED_DATA',
  REMOVE_FINISHED_DATA: 'REMOVE_FINISHED_DATA',
};

const getDate = () => {
  const objToday = new Date();
  const dayOfMonth = (objToday.getDate() < 10) ? `0${objToday.getDate()}` : objToday.getDate();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const curMonth = months[objToday.getMonth()];
  const curYear = objToday.getFullYear();
  const curHour =
  objToday.getHours() > 12 ?
    (objToday.getHours() - 12 < 10 ? `0${objToday.getHours() - 12}` : objToday.getHours() - 12) :
    (objToday.getHours() < 10 ? `0${objToday.getHours()}` : objToday.getHours());
  const curMinute = objToday.getMinutes() < 10 ? `0${objToday.getMinutes()}` : objToday.getMinutes();
  //const curSeconds = objToday.getSeconds() < 10 ? `0${objToday.getSeconds()}` : objToday.getSeconds();
  const curMeridiem = objToday.getHours() > 12 ? 'PM' : 'AM';
  
  return `${curHour}:${curMinute} ${curMeridiem} ${dayOfMonth}_${curMonth}_${curYear}`;  
}

// Define action creators
export const addSemiFinishedData = data => async dispatch => {

  //uplooading audio file
  let formData = new FormData();
  formData.append("audio", {
    uri: data.uri,
    name: `audio`,
    type: `audio/m4a`
  });

  axios
    .request({
      url: `${BASE_URL}/stt`,
      method: "POST",
      data: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data"
      }
    })
    .then(result => {
      //console.log(result.data.audio)
      let audioUri = `${FileSystem.documentDirectory}${data.uri.slice(data.uri.indexOf('recording'), -4)}.wav`
      try {
        FileSystem.writeAsStringAsync(
          audioUri,
          result.data.audio, {
            encoding: FileSystem.EncodingType.Base64,
          });
      } catch (error) {
        console.warn(error);
      }
      try {
        FileSystem.copyAsync({
          from: data.uri,
          to: `${audioUri.slice(0, -4)}-original.wav`,
        });
        /*FileSystem.writeAsStringAsync(
          `${audioUri.slice(0, -4)}-original.wav`,
          result.data.audio, {
            encoding: FileSystem.EncodingType.Base64,
          });*/
      } catch (error) {
        console.warn(error);
      }

      let name = getDate().split(' ').join('_');
      let id = data.uri.split('')
        .slice(data.uri.indexOf('recording') + 10, -4)
        .join('');
      dispatch({
        type: types.ADD_SEMI_FINISHED_DATA,
        payload: {
          id: id,
          name: name,
          uri: audioUri,
          originalUri: `${audioUri.slice(0, -4)}-original.wav`,
          wordInfo: result.data.wordInfo,
        },
      });
      console.log(result.data.wordInfo)
    })
    .catch(error => {
      alert("網路連線錯誤或伺服器忙碌");
      console.log(error);
    });
};

export const removeSemiFinishedData = dataArr => async dispatch => {
  for (let i = 0, len = dataArr.length; i < len; i += 1) {
    const dirInfo = await FileSystem.getInfoAsync(dataArr[i].uri);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(dataArr[i].uri);
    }
  }
  dispatch({
    type: types.REMOVE_SEMI_FINISHED_DATA,
    dataArr: dataArr,
  });
};

export const addFinishedData = data => async dispatch => {
  let date = getDate().split(' ').join('_');
  dispatch({
    type: types.ADD_FINISHED_DATA,
    payload: {
      id: data.id,
      name: data.name,
      description: date,
      uri: data.uri,
    }
  });
};

export const removeFinishedData = data => async dispatch => {
  const dirInfo = await FileSystem.getInfoAsync(data.uri);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(data.uri);
  }
  dispatch({
    type: types.REMOVE_FINISHED_DATA,
    payload: data,
  });
};

export const addSelectedData = data => dispatch => {
  dispatch({
    type: types.ADD_SELECTED_DATA,
    payload: data,
  });
};

export const removeSelectedData = data => dispatch => {
  dispatch({
    type: types.REMOVE_SELECTED_DATA,
    payload: data,
  });
};

export const selectAll = () => dispatch => {
  dispatch({
    type: types.SELECT_ALL,
  });
};

export const unselectAll = () => dispatch => {
  dispatch({
    type: types.UNSELECT_ALL,
  });
};
