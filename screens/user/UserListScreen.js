import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Button,
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
import {useIsFocused} from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../../configs/authConfig';

const UserListScreen = ({navigation}) => {
  const [userList, setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const isFocused = useIsFocused(); // not sure why using this

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await axios.get(`${BASE_URL}/users/all`);
      setUserList(users);
    };
    if (isFocused) {
      fetchUsers();
    }
  }, [isFocused]);

  const UserManagementHandler = async () => {
    //導向user權限管理的頁面
    navigation.navigate('UserManagement', {name: 'Manage user permission'});
  };

  const UserSelectHandler = async (user) => {
    setSelectedUserId(user.id);
    await navigation.navigate('UserManagement', {

    });
  };

  // const renderUsers = () => {

    return (
      <React.Fragment>
        <Text>使用者管理</Text>
      </React.Fragment>
    );
  // };
};

export default UserListScreen;
