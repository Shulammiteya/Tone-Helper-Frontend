import React from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  Divider,
  Toggle,
  TopNavigation,
  TopNavigationAction,
  IndexPath,
  Select,
  SelectItem,
} from '@ui-kitten/components';

import { Setting } from './settings-section.component';
import { Theming } from '../../services/theme.service';
import { DrawerIcon } from '../../components/icons';
import { SafeAreaLayout } from '../../components/safe-area-layout.component';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");

export const SettingsScreen = ({ navigation }) => {

  const themeContext = React.useContext(Theming.ThemeContext);
  const languageContext = React.useContext(Theming.LanguageContext);

  const [darkThemeEnabled, setDarkThemeEnabled] = React.useState(themeContext.isDarkMode());
  const [selectedLanguageIndex, setSelectedLanguageIndex] = React.useState(new IndexPath(0));

  const renderDrawerAction = () => (
    <TopNavigationAction
      icon={DrawerIcon}
      onPress={navigation.toggleDrawer}
    />
  );

  const toggleTheme = () => {
    if(!darkThemeEnabled)
      themeContext.setCurrentTheme('dark');
    else
      themeContext.setCurrentTheme('light')
    setDarkThemeEnabled(!darkThemeEnabled);
  };

  return (
    <SafeAreaLayout style={styles.safeArea} insets='top'>
      <TopNavigation
        title={languageContext.isChinese()? '我的設定' : 'My Settings'}
        accessoryLeft={renderDrawerAction}
        alignment='center'
      />
      <Divider/>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Setting
          style={styles.setting}
          hint={languageContext.isChinese()? '黑暗模式' : 'Dark Mode'}
          onPress={toggleTheme}>
          <Toggle
            checked={darkThemeEnabled}
            onChange={toggleTheme}
            status='info'
          />
        </Setting>
        <Setting
          style={styles.setting}
          hint={languageContext.isChinese()? '語言' : 'Language'}>
          <Select
            style={styles.select}
            value={languageContext.isChinese()? '中文' : 'English'}
            selectedIndex={selectedLanguageIndex}
            onSelect={index => {
              setSelectedLanguageIndex(index);
              if(index.row === 0)
                languageContext.setCurrentLanguage('Chinese');
              else
                languageContext.setCurrentLanguage('English')
            }}>
            <SelectItem title={languageContext.isChinese()? '中文模式' : 'Chinese mode'}/>
            <SelectItem title={languageContext.isChinese()? '英文模式' : 'English mode'}/>
          </Select>
        </Setting>
      </ScrollView>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    marginVertical: DEVICE_HEIGHT / 50,
  },
  setting: {
    padding: DEVICE_WIDTH / 15,
  },
  select: {
    width: DEVICE_WIDTH / 2.3,
  },
});
