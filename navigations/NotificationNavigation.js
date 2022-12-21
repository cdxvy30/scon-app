import React from 'react';
// import type {Node} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NotificationScreen from '../screens/setting/NotificationScreen';

const Stack = createNativeStackNavigator();

const NotificationNavigation = ({navigation}) => {
  return (
    <React.Fragment>
      <Stack.Navigator>
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{title: '通知'}}
        />
      </Stack.Navigator>
    </React.Fragment>
  );
};

export default NotificationNavigation;
