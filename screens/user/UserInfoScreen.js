import React, { useContext } from 'react';
import {Text, StyleSheet} from 'react-native';
import { Button } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import { AuthContext } from '../../context/AuthContext';

const UserInfoScreen = () => {
  const {userInfo, isLoading, logout} = useContext(AuthContext);

  return (
    <React.Fragment>
      <Spinner visible={isLoading} />
      <Text style={styles.welcome}>Welcome, {userInfo.user.name}</Text>
      <Button title="Logout" color="red" onPress={logout} />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    textAlign: 'center',
    fontSize: 30,
    marginBottom: 8,
  },
});

export default UserInfoScreen;
