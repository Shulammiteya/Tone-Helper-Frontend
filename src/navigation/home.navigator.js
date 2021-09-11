import React from 'react';
import { Dimensions,} from "react-native";
import { getFocusedRouteNameFromRoute } from '@react-navigation/core';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { HomeBottomNavigation } from '../scenes/home/home-bottom-navigation.component';
import { HomeDrawer } from '../scenes/home/home-drawer.component';
import GuidanceScreen from '../scenes/guidance/guidance.screen';
import { CompositionsNavigator } from './compositions.navigator'
import { RepertoireNavigator } from './repertoire.navigator'
import { SettingsNavigator } from './settings.navigator';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");

const BottomTab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const initialTabRoute = 'Repertoire';
const ROOT_ROUTES = ['Home', 'Compositions', 'Repertoire', 'Settings'];

const TabBarVisibilityOptions = ({ route }) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  //const isNestedRoute = route.state?.index > 0;
  const isRootRoute = ROOT_ROUTES.includes(routeName);

  //return { tabBarVisible: isRootRoute && !isNestedRoute };
  return { tabBarVisible: isRootRoute };
};

const HomeTabsNavigator = () => (
  <BottomTab.Navigator
    screenOptions={TabBarVisibilityOptions}
    initialRouteName={initialTabRoute}
    tabBar={props => <HomeBottomNavigation {...props} />}>
    <BottomTab.Screen name='Compositions' component={CompositionsNavigator}/>
    <BottomTab.Screen name='Repertoire' component={RepertoireNavigator}/>
    <BottomTab.Screen name='Settings' component={SettingsNavigator}/>
  </BottomTab.Navigator>
);

export const HomeNavigator = () => (
  <Drawer.Navigator
    screenOptions={{ gestureEnabled: true }}
    drawerType='back'
    drawerStyle={{width: DEVICE_WIDTH}}
    drawerContent={props => <HomeDrawer {...props}/>}
  >
    <Drawer.Screen name='Home' component={HomeTabsNavigator}/>
    <Drawer.Screen name='Guidance' component={GuidanceScreen}/>
  </Drawer.Navigator>
);
