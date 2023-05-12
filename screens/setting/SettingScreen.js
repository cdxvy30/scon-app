import React, {useContext} from 'react';
import {Text, StyleSheet, View, TouchableOpacity, Image, Dimensions} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {AuthContext} from '../../context/AuthContext';
import {useIsFocused} from '@react-navigation/native';
import UserManagementScreen from '../user/UserManagementListScreen';

const windowSize = Dimensions.get('window')

const SettingScreen = ({navigation}) => {
  const {userInfo, isLoading, getUsers, logout} = useContext(AuthContext);
  console.log(userInfo);

  const UserManagementHandler = async () => {
    navigation.navigate('UserList');
  };

  const dataManagementHandler = async () => {
    navigation.navigate('DataManagementList');
  };

  const ProjectManagementHandler = async () => {
    navigation.navigate('ProjectManagementList');
  }

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
          {(userInfo.user.permission == '管理員' || userInfo.user.permission == '公司負責人') &&
            <View>
              <TouchableOpacity
                onPress={UserManagementHandler}
                style={[styles.group]}>
              <Text style={[styles.text]}>{'使用者管理'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={ProjectManagementHandler}
                style={[styles.group]}>
                <Text style={[styles.text]}>{'專案管理'}</Text>
              </TouchableOpacity>
            </View>
          }
          {userInfo.user.permission != '訪客' &&
          <View>
            <TouchableOpacity
              onPress={dataManagementHandler}
              style={[styles.group]}>
              <Text style={[styles.text]}>{'資料管理'}</Text>
            </TouchableOpacity>
          </View>
          }
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    width: windowSize.width*0.8,
  },
  name: {
    alignSelf: 'center',
    height: windowSize.height*0.035,
    fontStyle: 'normal',
    fontSize: windowSize.height*0.035,
    lineHeight: windowSize.height*0.04,
    color: '#000000',
  },
  icon: {
    marginTop: windowSize.height*0.01,
    alignSelf: 'center',
    width: windowSize.height*0.2,
    height: windowSize.height*0.2,
    borderRadius: windowSize.height*0.2 / 2,
    borderColor: 'black',
    borderWidth: 2,
  },
  corporation: {
    marginTop: windowSize.height*0.01,
    alignSelf: 'center',
    height: windowSize.height*0.03,
    fontStyle: 'normal',
    fontSize: windowSize.height*0.03,
    lineHeight: windowSize.height*0.035,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  permission: {
    marginTop: windowSize.height*0.01,
    alignSelf: 'center',
    height: windowSize.height*0.03,
    fontStyle: 'normal',
    fontSize: windowSize.height*0.03,
    lineHeight: windowSize.height*0.035,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  job: {
    marginTop: windowSize.height*0.01,
    alignSelf: 'center',
    height: windowSize.height*0.03,
    fontStyle: 'normal',
    fontSize: windowSize.height*0.03,
    lineHeight: windowSize.height*0.035,
    color: 'rgba(0, 0, 0, 0.4)',
    marginBottom: windowSize.height*0.03,
  },
  group: {
    marginBottom: windowSize.height*0.015,
    backgroundColor: '#61dafb',
    paddingVertical: windowSize.height*0.015,
    borderRadius: 15,
  },
  text: {
    color: '#20232a',
    textAlign: 'center',
    fontSize: windowSize.height*0.035,
    fontWeight: 'bold',
  },
});

export default SettingScreen;
