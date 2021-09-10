import React from 'react';
import { Keyboard, StyleSheet, Dimensions } from 'react-native';
import { Button, Layout, Modal, Input } from '@ui-kitten/components';
import { useSelector, useDispatch } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import { Theming } from '../../../services/theme.service';
import { addFinishedData, removeSemiFinishedData } from '../../../redux/actions';

var Buffer = require('buffer/').Buffer

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");

export const ExportModal = (props) => {

  const { onOKButtonPress, ...modalProps } = props;

  const { selectedData } = useSelector(state => state.dataReducer);
  const dispatch = useDispatch();
  
  const languageContext = React.useContext(Theming.LanguageContext);

  const StatefulModalContent = (props) => {

    const [name, setName] = React.useState('');
    const [keyboardSize, setKeyboardSize] = React.useState(0);

    React.useEffect(() => {
      Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.addListener("keyboardDidHide", _keyboardDidHide);
  
      /*return () => {
        Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
        Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
      };*/
    }, []);
  
    const _keyboardDidShow = (e) => setKeyboardSize(e.endCoordinates.height);
    const _keyboardDidHide = (e) => setKeyboardSize(e.endCoordinates.height);
  
    const handleOKButtonPress = async () => {
      let base64Str = await FileSystem.readAsStringAsync(
        selectedData[0].uri, 
        { encoding: FileSystem.EncodingType.Base64 }
      );
      let buffer = new Buffer(base64Str , 'base64');
      for(let index = 1, len = selectedData.length; index < len; index++) {
        base64Str = await FileSystem.readAsStringAsync(
          selectedData[index].uri, 
          { encoding: FileSystem.EncodingType.Base64 }
        );
        let bufferTmp = new Buffer(base64Str , 'base64');
        buffer = Buffer.concat([buffer, bufferTmp.slice(44, bufferTmp.length)], buffer.length + bufferTmp.length - 44);
      }
      buffer.writeInt32LE(buffer.length - 8, 4);
      buffer.writeInt32LE(buffer.length - 44, 40);
      base64Str = new Buffer(buffer).toString('base64');
      try {
        await FileSystem.writeAsStringAsync(
          `${FileSystem.documentDirectory}MyAudioOnToneHelper${selectedData[0].uri.slice(selectedData[0].uri.indexOf('recording') + 9, -4)}.wav`,
          base64Str, {
            encoding: FileSystem.EncodingType.Base64,
          });
        let data = {
          id: selectedData[0].id,
          uri: `${FileSystem.documentDirectory}MyAudioOnToneHelper${selectedData[0].uri.slice(selectedData[0].uri.indexOf('recording') + 9, -4)}.wav`,
          name: name
        }
        dispatch(addFinishedData(data));
        dispatch(removeSemiFinishedData(selectedData));
      }
      catch(error) {
        alert('輸出失敗');
        console.warn(error);
      }
      setName('');
      onOKButtonPress();
    }
  
    return (
      <Layout style={[styles.container, {marginBottom: keyboardSize}]}>
        <Input
          status={'warning'}
          style={styles.description}
          placeholder={languageContext.isChinese()? '請輸入歌名' : 'Please enter the song Title.'}
          value={name}
          onChangeText={setName}
        />
        <Button
          appearance={'outline'}
          status={'warning'}
          style={styles.OKBtn}
          disabled={name.length <= 0}
          onPress={handleOKButtonPress}>
          {languageContext.isChinese()? '確認' : 'Confirm'}
        </Button>
      </Layout>
    );
  };

  return (
    <Modal
      backdropStyle={styles.backdrop}
      {...modalProps}>
        <StatefulModalContent />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: DEVICE_WIDTH / 20,
    width: DEVICE_WIDTH - 80,
  },
  description: {
    marginTop: DEVICE_HEIGHT / 30,
    marginHorizontal: DEVICE_WIDTH / 30,
    textAlign: 'center',
  },
  OKBtn: {
    alignSelf: 'center',
    marginTop: DEVICE_HEIGHT / 20,
    margin: DEVICE_HEIGHT / 30,
    borderRadius: 20,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
