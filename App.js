/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useContext, useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import TabNavigation from './navigations/TabNavigation';
import SqliteManager from './services/SqliteManager';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import {AuthProvider, AuthContext} from './context/AuthContext';
import Navigation from './navigations/Navigation';
import { APNContext, APNProvider } from './context/APNContext';

const App = () => {
  const [isDatabaseSetup, setIsDatabaseSetup] = useState(false);

  useEffect(() => {
    const dbSetup = async () => {
      await SqliteManager.dbInit();
      // await SqliteManager.dbInitSampleData();
      await SqliteManager.dbInitBasicData();
      setIsDatabaseSetup(true);
    };

    dbSetup();
  }, []);

  return (
    <ActionSheetProvider>
      <AuthProvider>
        <StatusBar backgroundColor="#06bcee" />
        <Navigation />
      </AuthProvider>
    </ActionSheetProvider>
  );
};

export default App;
