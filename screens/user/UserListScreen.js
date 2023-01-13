import React, {useEffect, useState} from 'react';
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

const UserListScreen = ({navigation}) => {
  const [userList, setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const isFocused = useIsFocused(); // not sure why using this

  useEffect(() => {
    const fetchUsers = () => {
      axios
        .get(`${BASE_URL}/users/all`, {
          // 帶token上去要
        })
        .then(async res => {
          let users = await res.data.rows;
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
  }, [isFocused]);

  const UserManageHandler = async user => {
    //導向user權限管理的頁面
    setSelectedUserId(user.id);
    await navigation.navigate('UserManagementScreen', {
      name: user.name,
    });
  };

  const Item = ({item, onPress, backgroundColor, textColor}) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
      <Text style={[styles.title, textColor]}>{item.user_name}</Text>
      <Text style={[styles.title, textColor]}>{item.user_corporation}</Text>
    </TouchableOpacity>
  );

  const [selectedId, setSelectedId] = useState(null);

  const renderItem = ({item}) => {
    const backgroundColor = item.id === selectedId ? '#600000' : '#ffffff';
    const color = item.id === selectedId ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => UserManageHandler(item.user_name)}
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
        extraData={selectedId}
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
    marginLeft: 12,
    fontSize: 24,
    width: 250,
    alignSelf: 'center',
  },
  status: {
    marginTop: 26,
  },
});

export default UserListScreen;
