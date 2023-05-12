import React, {useEffect, useState, useContext} from 'react';
import {
  ActionSheetIOS,
  Alert,
  Button,
  Dimensions,
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

const windowSize = Dimensions.get('window')

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
        .then(async (res) => {
          let users = await res.data;
          console.log(users);
          setUserList(users);
        })
        .catch((e) => {
          console.log(`List users error: ${e}`);
        });
    };
    if (isFocused) {
      fetchUsers();
    }
  }, [isFocused, userInfo, fetchRoute]);

  const UserManageHandler = async (user) => {
    setSelectedUserId(user.id);
    console.log(user);
    await navigation.navigate('UserManagement', {
      user_name: user.user_name,
      user_id: user.user_id,
      user_permission: user.user_permission,
      user_job: user.user_job,
    });
  };

  const Item = ({item, onPress, backgroundColor, textColor}) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
      <View>
        <Image
          style={styles.icon}
          source={require('../../configs/icon.png')}
        />
      </View>
      <View>
        <Text style={[styles.title, textColor, {marginBottom:windowSize.height*0.002}]} ellipsizeMode={'tail'} numberOfLines={1}>
          {item.user_name} | {item.user_corporation} 
        </Text>
        <Text style={[styles.title, textColor]} ellipsizeMode={'tail'} numberOfLines={1}>
          {item.user_permission} | {item.user_job}
        </Text>
        {/* <Text style={[styles.title, textColor]}>{item.user_corporation}</Text>
        <Text style={[styles.title, textColor]}>{item.user_job}</Text> */}
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const backgroundColor =
      item.id === setSelectedUserId ? '#600000' : '#ffffff';
    const color = item.id === setSelectedUserId ? 'white' : 'black';

    return (
      <View>
        <Item
          item={item}
          onPress={() => UserManageHandler(item)}
          backgroundColor={{ backgroundColor }}
          textColor={{ color }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.flatList}
        data={userList}
        renderItem={renderItem}
        keyExtractor={(item) => item.user_id}
        extraData={selectedUserId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: StatusBar.currentHeight || 0,
  },
  flatList: {
    padding: windowSize.height*0.015,
  },
  item: {
    marginVertical: windowSize.height*0.01,
    padding: windowSize.height*0.02,
    borderRadius: 15,
    flex:1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    width: windowSize.height*0.087,
    height: windowSize.height*0.087,
    borderRadius: windowSize.height*0.087 / 2,
    borderColor: 'black',
    borderWidth: windowSize.height*0.002,
  },
  title: {
    marginLeft: windowSize.height*0.01,
    fontSize: windowSize.width*0.05,
  },
});

export default UserListScreen;
