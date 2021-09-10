import React from 'react';
import { StyleSheet } from 'react-native';
import { Tab } from '@ui-kitten/components';

import { SafeAreaLayout } from '../../components/safe-area-layout.component';
import { BrandTabBar } from '../../components/brand-tab-bar.component';

import { Theming } from '../../services/theme.service';

export const CompositionsTopBarNavigator = ({ navigation, state }) => {
  
  const languageContext = React.useContext(Theming.LanguageContext);

  const onTabSelect = (index) => {
    navigation.navigate(state.routeNames[index]);
  };

  return (
    <SafeAreaLayout insets='top'>
      <BrandTabBar
        selectedIndex={state.index}
        onSelect={onTabSelect}>
        <Tab style={styles.topBar} title={languageContext.isChinese()? '錄音' : 'Recording'}/>
        <Tab style={styles.topBar} title={languageContext.isChinese()? '調音' : 'Tuning'}/>
      </BrandTabBar>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  topBar: {
    padding: 10,
  },
});
