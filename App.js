/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import TabNavigation from './navigations/TabNavigation';
import SqliteManager from './services/SqliteManager';

import {AuthProvider} from './context/AuthContext';
import Navigation from './navigations/Navigation';

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
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
};

export default App;
