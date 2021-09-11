import React from 'react';
import {
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Text,
  Layout,
  List,
  Card,
  Divider,
} from '@ui-kitten/components';
import * as FileSystem from 'expo-file-system';
import { useSelector } from 'react-redux';
import { EditPanel } from './editPanel'
import RenderItem from './renderItem';
import PlayerComponent from '../../../components/player.component'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");

export const ListScreen = ({ navigation }) => {

  const { semiFinishedData } = useSelector(state => state.dataReducer);

  const [playingDataUri, setPlayingDataUri] = React.useState('');

  const setItemToPlay = async (uri, index = -1) => {
    if(index >= 0) {
      const dirInfo = await FileSystem.getInfoAsync(uri);
      if (!dirInfo.exists) {
        alert("檔案毀損");
      }
    }
    setPlayingDataUri(uri);
  }

  const renderItem = ({ item, index }) => (
    <RenderItem
      item={item}
      index={index}
      navigation={navigation}
      playingDataUri={playingDataUri}
      setItemToPlay={setItemToPlay}
    />
  );

  const renderHeader = () => (
    <EditPanel
      playingDataUri={playingDataUri}
      setItemToPlay={setItemToPlay}
    />
  );

  return semiFinishedData.length > 0 ? (
    <Layout style={styles.container}>
      <Layout>{renderHeader()}</Layout>
        <List
          style={styles.listWrapper}
          //contentContainerStyle={styles.contentContainer}
          data={semiFinishedData}
          renderItem={renderItem}
          ItemSeparatorComponent={Divider}
          showsVerticalScrollIndicator={false}
        />
      {
        playingDataUri != '' ?
          ( <PlayerComponent uri={playingDataUri} setItemToPlay={setItemToPlay} /> ) : null
      }
    </Layout>
  ) : (
    <Layout style={styles.container} level='2'>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.noPermissionsCard}>
          <Text category="h6" style={styles.noPermissionsText}>
            No audio
          </Text>
          <Text /*appearance='hint'*/ style={styles.noPermissionsText}>
            尚未有歌曲
          </Text>
        </Card>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noPermissionsCard: {
    borderWidth: 4,
    borderRadius: 20,
    margin: DEVICE_WIDTH / 9,
    marginVertical: DEVICE_HEIGHT / 10,
  },
  noPermissionsText: {
    marginVertical:15,
    textAlign: "center",
  },
  listWrapper: {
    flex: 1,
    marginVertical: DEVICE_HEIGHT / 40,
    //borderRadius: 10,
    marginHorizontal: DEVICE_WIDTH / 15,
    marginBottom:  DEVICE_HEIGHT / 20,
  },
  contentContainer: {
    padding: DEVICE_WIDTH / 30,
    borderRadius: 15,
  },
});