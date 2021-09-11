import React from 'react';
import { BottomNavigationTab, Divider } from '@ui-kitten/components';

import { SafeAreaLayout } from '../../components/safe-area-layout.component';
import { BrandBottomNavigation } from '../../components/brand-bottom-navigation.component';
import { CompositionsIcon, RepertoireIcon, SettingsIcon } from '../../components/icons';
import { Theming } from '../../services/theme.service';

export const HomeBottomNavigation = (props): React.ReactElement => {

  const languageContext = React.useContext(Theming.LanguageContext);

  const onSelect = (index: number): void => {
    props.navigation.navigate(props.state.routeNames[index]);
  };

  return (
    <SafeAreaLayout insets='bottom'>
      <Divider/>
      <BrandBottomNavigation
        appearance='noIndicator'
        selectedIndex={props.state.index}
        onSelect={onSelect}>
        <BottomNavigationTab
          //title={languageContext.isChinese()? '創作' : 'Compositions'}
          icon={CompositionsIcon}
        />
        <BottomNavigationTab
          //title={languageContext.isChinese()? '曲庫' : 'Repertoire'}
          icon={RepertoireIcon}
        />
        <BottomNavigationTab
          //title={languageContext.isChinese()? '設定' : 'Settings'}
          icon={SettingsIcon}
        />
      </BrandBottomNavigation>
    </SafeAreaLayout>
  );
};
