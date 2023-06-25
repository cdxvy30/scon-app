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
  const { configure } = useContext(APNContext);

  useEffect(() => {
    const dbSetup = async () => {
      await SqliteManager.dbInit();
      // await SqliteManager.dbInitSampleData();
      await SqliteManager.dbInitBasicData();
      setIsDatabaseSetup(true);
    };

    configure();
    console.log('enter the project');

    dbSetup();
  }, []);
  // return (
  //   <React.Fragment>
  //     {isDatabaseSetup ? (
  //       <>
  //         <StatusBar
  //           animated={true}
  //           barStyle={'dark-content'} //'default', 'dark-content', 'light-content'
  //           showHideTransition={'fade'} //'fade', 'slide', 'none'
  //         />
  //         <NavigationContainer>
  //           <TabNavigation />
  //         </NavigationContainer>
  //       </>
  //     ) : (
  //       <></>
  //     )}
  //   </React.Fragment>
  // );
  return (
    <ActionSheetProvider>
      <AuthProvider>
        <APNProvider>
          <StatusBar backgroundColor="#06bcee" />
          <Navigation />
        </APNProvider>
      </AuthProvider>
    </ActionSheetProvider>
  );
};

export default App;
