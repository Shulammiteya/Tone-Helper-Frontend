import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'language';
const THEME_KEY = 'theme';

export class AppStorage {

  static getLanguage = (fallback) => {
    return AsyncStorage.getItem(LANGUAGE_KEY).then((language) => {
      return language || fallback;
    });
  };

  static getTheme = (fallback) => {
    return AsyncStorage.getItem(THEME_KEY).then((theme) => {
      return theme || fallback;
    });
  };

  static setLanguage = (language) => {
    return AsyncStorage.setItem(LANGUAGE_KEY, language);
  };

  static setTheme = (theme) => {
    return AsyncStorage.setItem(THEME_KEY, theme);
  };
}