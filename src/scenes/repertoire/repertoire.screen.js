import React from 'react';
import {
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Divider,
  TopNavigation,
  TopNavigationAction,
  List,
  Layout,
  Text,
  Card,
} from '@ui-kitten/components';
import { SearchBar } from 'react-native-elements';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Theming } from '../../services/theme.service';
import { DrawerIcon } from '../../components/icons';
import { SafeAreaLayout } from '../../components/safe-area-layout.component';
import { useSelector, useDispatch } from 'react-redux';
import { removeFinishedData } from '../../redux/actions';
import RenderItem from './renderItem';
import PlayerComponent from '../../components/player.component'
import Swipeable from 'react-native-gesture-handler/Swipeable';

import * as eva from '@eva-design/eva';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");

export const RepertoireScreen = ({ navigation }) => {

  const themeContext = React.useContext(Theming.ThemeContext);
  const languageContext = React.useContext(Theming.LanguageContext);

  const searchRef = React.useRef();
  
  const { finishedData } = useSelector(state => state.dataReducer);
  const [playingDataUri, setPlayingDataUri] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const dispatch = useDispatch();

  let row = [];
  let prevOpenedRow;

  const renderDrawerAction = () => (
    <TopNavigationAction
      icon={DrawerIcon}
      onPress={navigation.toggleDrawer}
      onPressIn={() => {searchRef.current.blur()}}
    />
  );

  const setItemToPlay = async (uri, index = -1) => {
    if(index >= 0) {
      const dirInfo = await FileSystem.getInfoAsync(uri);
      if (!dirInfo.exists) {
        alert("檔案毀損");
      }
    }
    setPlayingDataUri(uri);
  }

  const filterHandler = (searchInput) => {
    setSearchQuery(searchInput);
    filteredDataUpToSearch();
  };

  const filteredDataUpToSearch = () => {
    let filteredData;
    if (searchQuery) {
      filteredData = finishedData.filter( data =>
        (data.name.includes(searchQuery) || data.description.includes(searchQuery))
      );
    }
    else {
      filteredData = finishedData;
    }
    return filteredData;
  };

  const closeRow = (index) => {
    if(index >= 0) {
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    }
    else if (prevOpenedRow) {
      prevOpenedRow.close();
      prevOpenedRow = null;
    }
  }

  const renderItem = ({ item, index }) => (
    <Swipeable
      renderLeftActions={(progress, dragX) => (
        <LeftActions progress={progress} dragX={dragX} item={item} />
      )}
      renderRightActions={(progress, dragX) => (
        <RightActions progress={progress} dragX={dragX} item={item} />
      )}
      ref={ref => row[index] = ref}
      friction={1.2}
      onSwipeableOpen={() => closeRow(index)}
    >
      <RenderItem
        item={item}
        index={index}
        playingDataUri={playingDataUri}
        setItemToPlay={setItemToPlay}
      />
    </Swipeable>
  );

  const RightActions = ({progress, dragX, item}) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
    });
    return (
      <TouchableOpacity onPress={() => deletePressed(item)}>
        <View style={styles.swipeRightAction}>
          <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          {languageContext.isChinese()? '刪除' : 'Delete'}
          </Animated.Text>
        </View>
      </TouchableOpacity>
    );
  };

  const deletePressed = async (item) => {
    if(playingDataUri === item.uri)
      setItemToPlay('');
    closeRow(-1);
    dispatch(removeFinishedData(item));
  }

  const sharePressed = async (item) => {
    await Sharing.shareAsync(item.uri);
    closeRow(-1);
  }

  const LeftActions = ({progress, dragX, item}) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
    });
    return (
      <TouchableOpacity onPress={() => sharePressed(item)}>
        <View style={styles.swipeLeftAction}>
          <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          {languageContext.isChinese()? '分享' : 'Share'}
          </Animated.Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaLayout style={styles.safeArea} insets='top'>
      <TopNavigation
        title={languageContext.isChinese()? '我的曲庫' : 'My Repertoire'}
        accessoryLeft={renderDrawerAction}
        alignment='center'
      />
      <Divider/>
      <Layout style={styles.header} level='1' >
        <SearchBar
          ref={searchRef}
          round
          searchIcon={{ size: 30 }}
          lightTheme={!themeContext.isDarkMode()}
          containerStyle={styles.searchBar}
          inputContainerStyle={{backgroundColor: themeContext.isDarkMode()? '#222222' : '#EFEFEF'}}
          //placeholder={languageContext.isChinese()? '搜尋' : 'Search'}
          onChangeText={filterHandler}
          value={searchQuery}
        />
      </Layout>
      {
        filteredDataUpToSearch().length > 0
        ? (
          <Layout style={styles.container}>
            <List
              style={styles.listWrapper}
              data={filteredDataUpToSearch()}
              renderItem={renderItem}
              ItemSeparatorComponent={Divider}
              showsVerticalScrollIndicator={false}
            />
            {
              playingDataUri != '' ?
                ( <PlayerComponent uri={playingDataUri} setItemToPlay={setItemToPlay} /> ) : null
            }
          </Layout>
        )
        : (
          <Layout style={styles.container} level='1'>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Card style={styles.noPermissionsCard}>
                <Text category="h6" style={styles.noPermissionsText}>
                  No audio.
                </Text>
                <Text /*appearance='hint'*/ style={styles.noPermissionsText}>
                  尚未有歌曲
                </Text>
              </Card>
            </ScrollView>
          </Layout>
        )
      }
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: DEVICE_WIDTH / 20,
    paddingVertical: DEVICE_HEIGHT / 60,
  },
  listWrapper: {
    flex: 1,
    marginHorizontal: DEVICE_WIDTH / 15,
    marginVertical:  DEVICE_HEIGHT / 60,
    marginBottom:  DEVICE_HEIGHT / 20,
  },
  container: {
    flex: 1,
  },
  noPermissionsCard: {
    borderWidth: 4,
    borderRadius: 20,
    margin: DEVICE_WIDTH / 6,
    marginVertical: DEVICE_HEIGHT / 12,
  },
  noPermissionsText: {
    marginVertical:15,
    textAlign: "center",
  },
  swipeLeftAction: {
    justifyContent: 'center',
    flex: 1,
  },
  swipeRightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
  },
  actionText: {
    color: '#bbb',
    fontSize: DEVICE_WIDTH / 20,
    padding: DEVICE_WIDTH / 12,
  },
  searchBar: {
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
