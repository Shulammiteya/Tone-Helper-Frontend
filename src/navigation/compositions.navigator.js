import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { CompositionsTopBarNavigator } from '../scenes/compositions/compositions.top-bar.navigator';
import RecordingScreen from '../scenes/compositions/recording/recording.screen';
import { ListScreen } from '../scenes/compositions/list/list.scene';
import TuningScreen from '../scenes/compositions/tuning/tuning.scene';

const TopTab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const CompositionsMenuNavigator = () => (
  <TopTab.Navigator tabBar={(props) => <CompositionsTopBarNavigator {...props}/>}>
    <TopTab.Screen name='RecordingScreen' component={RecordingScreen}/>
    <TopTab.Screen name='ListScreen' component={ListScreen}/>
  </TopTab.Navigator>
);

export const CompositionsNavigator = () => (
  <Stack.Navigator headerMode='none'>
    <Stack.Screen name='Compositions' component={CompositionsMenuNavigator}/>
    <Stack.Screen name='TuningScreen' component={TuningScreen}/>
  </Stack.Navigator>
);
