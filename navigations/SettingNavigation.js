import React from 'react';
// import type {Node} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProfileSettingScreen from '../screens/setting/ProfileSettingScreen';

const Stack = createNativeStackNavigator();

const SettingNavigation = ({navigation}) => {
  return (
    <React.Fragment>
      <Stack.Navigator>
        <Stack.Screen
          name="Settings"
          component={ProfileSettingScreen}
          options={{title: '設定列表'}}
        />
      </Stack.Navigator>
    </React.Fragment>
  );
};

export default SettingNavigation;
