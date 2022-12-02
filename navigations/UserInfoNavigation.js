import React from 'react';
// import type {Node} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import UserInfoScreen from '../screens/users/UserInfoScreen';

const Stack = createNativeStackNavigator();

const UserInfoNavigation = ({navigation}) => {
  return (
    <React.Fragment>
      <Stack.Navigator>
        <Stack.Screen
          name="UserInfo"
          component={UserInfoScreen}
          options={{title: '使用者資訊'}}
        />
      </Stack.Navigator>
    </React.Fragment>
  );
};

export default UserInfoNavigation;
