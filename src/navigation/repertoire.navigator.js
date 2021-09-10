import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RepertoireScreen } from '../scenes/repertoire/repertoire.screen';

const Stack = createStackNavigator();

export const RepertoireNavigator = () => (
  <Stack.Navigator headerMode='none'>
    <Stack.Screen name='Repertoire' component={RepertoireScreen}/>
  </Stack.Navigator>
);
