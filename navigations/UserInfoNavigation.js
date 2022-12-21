import React from 'react';
// import type {Node} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import UserInfoScreen from '../screens/user/UserInfoScreen';
import ProfileSettingScreen from '../screens/setting/ProfileSettingScreen';

const Stack = createNativeStackNavigator();

const UserInfoNavigation = ({}) => {
  return (
    <React.Fragment>
      <Stack.Navigator>
        <Stack.Screen
          name="UserInfo"
          component={UserInfoScreen}
          options={{title: '設定'}}
        />
        <Stack.Screen
          name="Setting"
          component={ProfileSettingScreen}
          options={{title: '設定列表'}}
        />
      </Stack.Navigator>
    </React.Fragment>
  );
};

export default UserInfoNavigation;
