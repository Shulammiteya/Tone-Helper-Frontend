import React, { ReactElement, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Divider,
  Drawer,
  DrawerItem,
  DrawerElement,
  Layout,
  Text,
  IndexPath,
} from '@ui-kitten/components';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { GuidanceIcon, IntroductionIcon } from '../../components/icons';
import { SafeAreaLayout } from '../../components/safe-area-layout.component';
import { WebBrowserService } from '../../services/web-browser.service';
import { AppInfoService } from '../../services/app-info.service';
import { Theming } from '../../services/theme.service';

const version: string = AppInfoService.getVersion();

export const HomeDrawer = ({ navigation }): DrawerElement => {
  
  const languageContext = React.useContext(Theming.LanguageContext);
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(null);
  const [URL, setURL] = useState<string>(null);

  React.useEffect(() => {
    getURL();
  }, []);

  const getURL = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getURL`);
      if (response.data) {
        setURL(response.data);
      } else {
        console.log('Unable to fetch data from the API BASE URL!');
      }
    }
    catch {
      Alert.alert("網路連線錯誤或伺服器忙碌");
    }
  }

  const DATA = [
    {
      title: languageContext.isChinese()? '指南' : 'Guidance',
      icon: GuidanceIcon,
      onPress: () => {
        navigation.toggleDrawer();
        navigation.navigate('Guidance');
      },
    },
    {
      title: languageContext.isChinese()? '介紹' : 'Introduction',
      icon: IntroductionIcon,
      onPress: async () => {
        if(URL) {
          WebBrowserService.openBrowserAsync(URL);
        }
        else {
          await getURL();
          WebBrowserService.openBrowserAsync(URL);
        }
        navigation.toggleDrawer();
      },
    },
  ];

  const renderHeader = (): ReactElement => (
    <SafeAreaLayout insets='top' level='2'>
      <Layout style={styles.header} level='2'>
        <View style={styles.profileContainer}>
          {
          <Avatar
            size='giant'
            source={require('../../../assets/icon.png')}
          />
          }
          <Text style={styles.profileName} category='h6'>
            {languageContext.isChinese()? '百萬調音師' : 'Tone Helper'}
          </Text>
        </View>
      </Layout>
    </SafeAreaLayout>
  );

  const renderFooter = () => (
    <SafeAreaLayout insets='bottom'>
      <React.Fragment>
        <Divider />
        <View style={styles.footer}>
          {languageContext.isChinese()?
            <Text>{`版本 ${AppInfoService.getVersion()}`}</Text>
            :
            <Text>{`Version ${AppInfoService.getVersion()}`}</Text>
          }
        </View>
      </React.Fragment>
    </SafeAreaLayout>
  );

  return (
    <Drawer
      header={renderHeader}
      footer={renderFooter}
      //selectedIndex={selectedIndex}
      onSelect={(index) => setSelectedIndex(index)}
    >
      {DATA.map((el, index) => (
        <DrawerItem
          key={index}
          title={el.title}
          onPress={el.onPress}
          accessoryLeft={el.icon}
        />
      ))}
    </Drawer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 128,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 16,
    height: 30,
    marginTop: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    marginHorizontal: 16,
  },
});