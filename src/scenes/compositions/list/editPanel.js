import React from 'react';
import {
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Button,
  Layout,
  Icon,
} from '@ui-kitten/components';
import { useSelector, useDispatch } from 'react-redux';
import { Theming } from '../../../services/theme.service';
import { selectAll, unselectAll, removeSemiFinishedData } from '../../../redux/actions';
import { ExportModal } from './editPanel-export-modal';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");

export const EditPanel = ({ playingDataUri, setItemToPlay }) => {

  const { semiFinishedData, selectedData } = useSelector(state => state.dataReducer);
  const [exportModalVisible, setExportModalVisible] = React.useState(false);
  const dispatch = useDispatch();

  const languageContext = React.useContext(Theming.LanguageContext);

  const handleSelectBtn = () => {
    if(semiFinishedData.length > selectedData.length)
      dispatch(selectAll());
    else
      dispatch(unselectAll());
  }

  const handleExportBtn = () => {
    setPlayingData();
    setExportModalVisible(true);
  }

  const handleDeleteBtn = () => {
    setPlayingData();
    dispatch(removeSemiFinishedData(selectedData));
  }

  const setPlayingData = () => {
    for(let index = 0; index < selectedData.length; index++) {
      if(playingDataUri === selectedData[index].uri)
        setItemToPlay('');
    }
  }
  
  return (
    <Layout style={styles.panel} level='3' >
      <ExportModal
        visible={exportModalVisible}
        onBackdropPress={() => setExportModalVisible(false)}
        onOKButtonPress={() => setExportModalVisible(false)}
      />
      <Button
        onPress={handleSelectBtn}
        appearance='ghost'
        size='small'
        status='warning'
        style={styles.panelBtn}
        accessoryLeft={
          (props) => {
            if(DEVICE_WIDTH > 250)
              return <Icon {...props} name={semiFinishedData.length > selectedData.length? 'checkmark-square-2' : 'close-square'} />;
            else
              return null;
          }
        }
      >
        {
          semiFinishedData.length > selectedData.length
            ? languageContext.isChinese()? '全選' : 'Select All'
            : languageContext.isChinese()? '取消全選' : 'Unselect All'
        }
      </Button>
      <Button
        onPress={handleExportBtn}
        disabled={selectedData.length === 0}
        appearance='ghost'
        size='small'
        status='warning'
        style={styles.panelBtn}
        accessoryLeft={
          (props) => {
            if(DEVICE_WIDTH > 250)
              return <Icon {...props} name='file-add'/>;
            else
              return null;
          }
        }
      >
        {languageContext.isChinese()? '匯出' : 'Export'}
      </Button>
      <Button
        onPress={handleDeleteBtn}
        disabled={selectedData.length === 0}
        appearance='ghost'
        size='small'
        status='warning'
        style={styles.panelBtn}
        accessoryLeft={
          (props) => {
            if(DEVICE_WIDTH > 250)
              return <Icon {...props} name='trash-2'/>;
            else
              return null;
          }
        }
      >
        {languageContext.isChinese()? '刪除' : 'Delete'}
      </Button>
    </Layout>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: DEVICE_HEIGHT / 40,
    borderRadius: 10,
  },
  panelBtn: {
    paddingVertical: 16,
    width: (DEVICE_WIDTH - 24) / 3,
  },
});