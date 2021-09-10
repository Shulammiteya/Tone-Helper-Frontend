import React from 'react';
import { AppearanceProvider } from 'react-native-appearance';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { StatusBar } from 'expo-status-bar';
import * as eva from '@eva-design/eva';

import { AppLoading } from './app-loading.component';
import { appLanguages, appThemes } from './app-theming';
import { SplashImage } from '../components/splash-image.component';
import { AppNavigator } from '../navigation/app.navigator';
import { AppStorage } from '../services/app-storage.service';
import { Theming } from '../services/theme.service';


const App = ({ language, theme }) => {

  const [languageContext] = Theming.useLanguage(appLanguages, language);
  const [themeContext, currentTheme] = Theming.useTheming(appThemes, theme);

  return (
    <React.Fragment>
      <IconRegistry icons={[EvaIconsPack, /*AppIconsPack*/]}/>
      <AppearanceProvider>
        <ApplicationProvider  {...eva} theme={currentTheme}>
          <Theming.ThemeContext.Provider value={themeContext}>
            <Theming.LanguageContext.Provider value={languageContext}>
              <SafeAreaProvider>
                  <StatusBar style="auto"/>
                  <AppNavigator/>
              </SafeAreaProvider>
            </Theming.LanguageContext.Provider>
          </Theming.ThemeContext.Provider>
        </ApplicationProvider>
      </AppearanceProvider>
    </React.Fragment>
  );
};

const loadingTasks = [
  () => AppStorage.getLanguage(defaultConfig.language).then(result => ['language', result]),
  () => AppStorage.getTheme(defaultConfig.theme).then(result => ['theme', result]),
];

const defaultConfig = {
  language: 'Chinese',
  theme: 'light',
};

const Splash = ({ loading }) => (
  <SplashImage
    loading={loading}
    source={require('../../assets/splash.png')}
  />
);

export default () => (
  <AppLoading
    tasks={loadingTasks}
    initialConfig={defaultConfig}
    placeholder={Splash}>
    {props => <App {...props}/>}
  </AppLoading>
);
