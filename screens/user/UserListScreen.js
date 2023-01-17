import React, {useEffect, useState, useContext} from 'react';
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
import Swipeout from 'react-native-swipeout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Separator from '../../components/Separator';
import {useIsFocused} from '@react-navigation/native';
import axios from 'axios';
import {BASE_URL} from '../../configs/authConfig';
import {AuthContext} from '../../context/AuthContext';

const UserListScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);
  const [userList, setUserList] = useState([]);
  const [fetchRoute, setFetchRoute] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const isFocused = useIsFocused(); // not sure why using this

  useEffect(() => {
    if (userInfo.user.permission == '管理員') {
      setFetchRoute(`${BASE_URL}/users/all`);
    } else if (userInfo.user.permission == '公司負責人') {
      setFetchRoute(`${BASE_URL}/users/${userInfo.user.corporation}`);
    }

    console.log(fetchRoute);
    const fetchUsers = () => {
      axios
        .get(fetchRoute, {
          headers: {
            Authorization: `Bearer ` + `${userInfo.token}`,
          },
        })
        .then(async res => {
          let users = await res.data;
          console.log(users);
          setUserList(users);
        })
        .catch(e => {
          console.log(`List Users Error: ${e}`);
        });
    };
    if (isFocused) {
      fetchUsers();
    }
  }, [isFocused, userInfo, fetchRoute]);

  const UserManageHandler = async user => {
    setSelectedUserId(user.id);
    console.log(user);
    await navigation.navigate('UserManagementScreen', {
      username: user.user_name,
      permission: user.user_permission,
      job: user.user_job,
    });
  };

  const Item = ({item, onPress, backgroundColor, textColor}) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
      <Text style={[styles.title, textColor]}>
        {item.user_name}
        {item.user_corporation}
        {item.user_permission}
        {item.user_job}
      </Text>
      {/* <Text style={[styles.title, textColor]}>{item.user_corporation}</Text>
      <Text style={[styles.title, textColor]}>{item.user_job}</Text> */}
    </TouchableOpacity>
  );

  const renderItem = ({item}) => {
    const backgroundColor = item.id === setSelectedUserId ? '#600000' : '#ffffff';
    const color = item.id === setSelectedUserId ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => UserManageHandler(item)}
        backgroundColor={{backgroundColor}}
        textColor={{color}}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={userList}
        renderItem={renderItem}
        keyExtractor={item => item.user_id}
        extraData={selectedUserId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  flatList: {
    height: 'auto',
  },
  item: {
    padding: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  title: {
    marginLeft: 8,
    fontSize: 20,
    width: 250,
    alignSelf: 'center',
  },
  status: {
    marginTop: 26,
  },
});

export default UserListScreen;
