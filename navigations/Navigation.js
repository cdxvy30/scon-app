import React, {useContext} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TabNavigation from '../navigations/TabNavigation';
import {AuthContext} from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const {userInfo} = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userInfo.token ? (
          <Stack.Screen
            name="Tab"
            component={TabNavigation}
            options={{headerShown: false}}
          />
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{headerShown: false}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
