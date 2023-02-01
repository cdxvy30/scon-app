import React, { useEffect, useState, useContext } from "react";
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
} from "react-native";
import Swipeout from "react-native-swipeout";
import Ionicons from "react-native-vector-icons/Ionicons";
import Separator from "../../components/Separator";
import { useIsFocused } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../../configs/authConfig";
import { AuthContext } from "../../context/AuthContext";

const ProjectManagementScreen = ({ navigation, route }) => {
  const userInfo = useContext(AuthContext);
  console.log(route.params);
  let project = route.params;
  const [userList, setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [fetchRoute, setFetchRoute] = useState("");
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchProjectManager = () => {
      axios
        .get(
          `${BASE_URL}/users/project/manager/${project.project_corporation}`,
          {
            headers: {
              Authorization: `Bearer ` + `${userInfo.token}`,
            },
          }
        )
        .then(async (res) => {
          let users = await res.data;
          setUserList(users);
        })
        .catch((e) => {
          console.log(`List available project manager error: ${e}`);
        });
    };

    if (isFocused) {
      fetchProjectManager();
    }
  }, [isFocused, project.project_corporation, userInfo]);

  const Item = ({item, onPress, backgroundColor, textColor}) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
      <Text style={[styles.title, textColor]}>
        {item.user_name} | {item.user_corporation} | {item.user_permission} |{' '}
        {item.user_job}
      </Text>
      {/* <Text style={[styles.title, textColor]}>{item.user_corporation}</Text>
      <Text style={[styles.title, textColor]}>{item.user_job}</Text> */}
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const backgroundColor =
      item.id === setSelectedUserId ? '#600000' : '#ffffff';
    const color = item.id === setSelectedUserId ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => {
          Alert.alert(
            `確認將${item.user_name}設為此專案之專案管理員？`,
            '',
          [
            {
              text: '取消',
              style: 'cancel',
              onPress: () => {
                return;
              },
            },
            {
              text: '確認',
              onPress: () => {
                console.log(item.user_id);
                console.log(project.project_id);
                axios
                  .post(`${BASE_URL}/worksOn/${item.user_id}/${project.project_id}`, {
                    headers: {
                      Authorization: `Bearer ` + `${userInfo.token}`,
                    },
                  })
                  .then(async (res) => {
                    let data = res.data;
                    console.log(data);
                  })
                  .catch((e) => {
                    console.log(`Bind project and manager error: ${e}`);
                  });
                navigation.goBack();
              },
            },
          ]);
        }}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
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
    marginTop: StatusBar.currentHeight || 0,
  },
  flatList: {
    height: "auto",
  },
  item: {
    padding: 20,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
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
    alignSelf: "center",
  },
  status: {
    marginTop: 26,
  },
});

export default ProjectManagementScreen;
