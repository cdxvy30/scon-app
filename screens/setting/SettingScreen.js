import React, {useContext} from 'react';
import {Text, StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {AuthContext} from '../../context/AuthContext';
import {useIsFocused} from '@react-navigation/native';
import UserManagementScreen from '../user/UserListScreen';

const SettingScreen = ({navigation}) => {
  const {userInfo, isLoading, getUsers, logout} = useContext(AuthContext);
  console.log(userInfo);

  const UserManagementHandler = async () => {
    navigation.navigate('UserListScreen');
  };

  const dataManagementHandler = async () => {
    navigation.navigate('DataManageList');
  };

  return (
    <React.Fragment>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <Text style={styles.name}>{userInfo.user.name}</Text>
          <Image
            style={styles.icon}
            source={require('../../configs/icon.png')}
          />
          <Text style={styles.corporation}>
            公司: {userInfo.user.corporation}
          </Text>
          <Text style={styles.permission}>
            權限: {userInfo.user.permission}
          </Text>
          <Text style={styles.job}>職稱: {userInfo.user.job}</Text>
          <TouchableOpacity
            onPress={UserManagementHandler}
            style={[styles.group]}>
            <Text style={[styles.text]}>{'使用者管理'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} style={[styles.group]}>
            <Text style={[styles.text]}>{'編輯個人資料'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={dataManagementHandler}
            style={[styles.group]}>
            <Text style={[styles.text]}>{'資料管理'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[styles.group]}>
            <Text style={[styles.text]}>{'登出'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    width: '80%',
  },
  name: {
    alignSelf: 'center',
    height: 44,
    fontStyle: 'normal',
    fontSize: 36,
    lineHeight: 44,
    color: '#000000',
  },
  icon: {
    marginTop: 10,
    alignSelf: 'center',
    width: 157,
    height: 157,
    borderRadius: 157 / 2,
    borderColor: 'black',
    borderWidth: 2,
  },
  corporation: {
    marginTop: 10,
    alignSelf: 'center',
    height: 34,
    fontStyle: 'normal',
    fontSize: 28,
    lineHeight: 34,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  permission: {
    alignSelf: 'center',
    height: 34,
    fontStyle: 'normal',
    fontSize: 28,
    lineHeight: 34,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  job: {
    alignSelf: 'center',
    height: 34,
    fontStyle: 'normal',
    fontSize: 28,
    lineHeight: 34,
    color: 'rgba(0, 0, 0, 0.4)',
    marginBottom: 20,
  },
  group: {
    marginBottom: 20,
    backgroundColor: '#61dafb',
    paddingVertical: '3%',
    borderRadius: 10,
  },
  text: {
    color: '#20232a',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
  },
  logout: {
    textAlign: 'center',
    fontSize: 20,
    alignSelf: 'center',
    color: 'red',
  },
});

export default SettingScreen;
