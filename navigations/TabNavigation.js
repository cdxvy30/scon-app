import React from 'react';
// import type {Node} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ProjectNavigation from './ProjectNavigation';
import SettingNavigation from './SettingNavigation';
import UserInfoNavigation from './UserInfoNavigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const TabNavigation = ({}) => {
  return (
    <React.Fragment>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName;

            if (route.name === '專案') {
              console.log(route.name);
              iconName = focused ? 'ios-newspaper' : 'ios-newspaper-outline';
            } else if (route.name === '設定') {
              console.log(route.name);
              iconName = focused
                ? 'ios-settings-sharp'
                : 'ios-settings-outline';
            } else if (route.name === '使用者資訊') {
              console.log(route.name);
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}>
        <Tab.Screen name="專案" component={ProjectNavigation} />
        <Tab.Screen name="設定" component={SettingNavigation} />
        <Tab.Screen name="使用者資訊" component={UserInfoNavigation} />
      </Tab.Navigator>
    </React.Fragment>
  );
};

export default TabNavigation;
