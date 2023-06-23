import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  View,
  Button,
} from 'react-native';
import { BASE_URL } from '../../configs/authConfig';
import { socket } from '../../configs/socket';
import { AuthContext } from '../../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';

const NotificationScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const fetchNotifications = async () => {
    console.log(notifications);
    await axios({
      method: 'get',
      url: `${BASE_URL}/notifications/${userInfo.user.uuid}`,
      headers: {
        Authorization: `Bearer ` + `${userInfo.token}`,
      },
    })
      .then(async (res) => {
        let data = await res.data;
        setNotifications(data);
        if (data === undefined) {
          setNotifications(data);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
        fetchNotifications();
      }, 100);
    }
  }, [isFocused, userInfo.user.uuid]);

  useEffect(() => {
    if (refreshing) {
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        numColumns={1}
        renderItem={({ item, index }) => <Text>{item.notify_msg}</Text>}
        refreshing={refreshing}
        onRefresh={() => setRefreshing(true)}
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
    height: "auto",
  },
  item: {
    padding: 20,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    // marginVertical: 8,
    // marginHorizontal: 16,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  title: {
    marginLeft: 12,
    fontSize: 24,
    width: '65%',
    alignSelf: "center",
  },
  status: {
    marginTop: 26,
  },
});

export default NotificationScreen;
