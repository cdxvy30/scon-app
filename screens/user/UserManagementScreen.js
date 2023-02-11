import React, {useEffect, useState, useContext} from 'react';
import {AuthContext} from '../../context/AuthContext';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {Button} from 'react-native-elements';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import {BASE_URL} from '../../configs/authConfig';

const UserManagementScreen = ({navigation, route}) => {
  console.log(route.params);
  let user = route.params;
  const {userInfo} = useContext(AuthContext); // for token
  const [userId, setUserId] = useState(user.user_id);
  const [name, setName] = useState(user.user_name);
  const [permission, setPermission] = useState(user.user_permission);
  const [job, setJob] = useState(user.job);

  const permissionList = [
    {label: '公司負責人', value: '公司負責人'},
    {label: '專案管理員', value: '專案管理員'},
    {label: '專案使用者', value: '專案使用者'},
    {label: '訪客', value: '訪客'},
  ];

  const jobList = [
    {label: '', value: ''},
    {label: '', value: ''},
    {label: '', value: ''},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Image
          style={styles.icon}
          source={require('../../configs/icon.png')}
        />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.permission}>目前權限: {permission}</Text>
        <Dropdown
          style={styles.dropdown}
          data={permissionList}
          placeholder="請選擇要更改的權限"
          labelField="label"
          valueField="value"
          value={permission}
          onChange={item => {
            setPermission(item.value);
          }}
          renderLeftIcon={() => (
            <AntDesign name="Safety" size={24} />
          )}
        />
        <Button
          title="更新"
          onPress={async () => {
            axios
              .post(`${BASE_URL}/permissions/manage`, {
                userId,
                permission,
              })
              .then(async res => {
                let data = res.data;
                console.log(data);
                navigation.goBack();
              })
              .catch(e => {
                console.log(`Update user permission error: ${e}`);
                navigation.goBack();
              });
          }}
        />
      </View>
    </View>
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
  icon: {
    marginVertical:12,
    alignSelf: 'center',
    width: 157,
    height: 157,
    borderRadius: 157 / 2,
    borderColor: 'black',
    borderWidth: 2,
  },
  name: {
    alignSelf: 'center',
    height: 44,
    fontStyle: 'normal',
    fontSize: 36,
    lineHeight: 44,
    color: '#000000',
  },
  permission: {
    alignSelf: 'center',
    height: 44,
    fontStyle: 'normal',
    fontSize: 24,
    lineHeight: 44,
    color: '#000000',
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
});

export default UserManagementScreen;
