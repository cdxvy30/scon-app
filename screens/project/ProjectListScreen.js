import React, { useEffect, useState, useContext } from "react";
import {
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
} from "react-native";
import Swipeout from "react-native-swipeout";
import Separator from "../../components/Separator";
import Ionicons from "react-native-vector-icons/Ionicons";
import SqliteManager from "../../services/SqliteManager";
import { useIsFocused } from "@react-navigation/native";
import { transformProjects } from "../../util/sqliteHelper";
import { VerticalAlign } from "docx";
import FastImage from "react-native-fast-image";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../configs/authConfig";
import axios from "axios";

const determineStatusColor = (item) => {
  let color = "grey";
  // if (item.status === 0) color = 'limegreen';
  // if (item.status === 1) color = 'gold';
  // if (item.status === 2) color = 'orangered';

  return color;
};

const ProjectListScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const [fetchRoute, setFetchRoute] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const isFocused = useIsFocused();

  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     const projects = await SqliteManager.getAllProjects(); // 改成向遠端主機fetch
  //     const transformedProjects = transformProjects(projects);
  //     const sortedProjects = transformedProjects.sort(
  //       (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  //     );
  //     console.log(sortedProjects);
  //     setProjectList(sortedProjects);
  //   };

  //   if (isFocused) {
  //     fetchProjects();
  //   }
  // }, [isFocused]);

  useEffect(() => {
    if (userInfo.user.permission == "管理員")
      setFetchRoute(`${BASE_URL}/projects/list/all`);
    else if (userInfo.user.permission == "公司負責人")
      setFetchRoute(`${BASE_URL}/projects/list/${userInfo.user.corporation}`);
    else if (userInfo.user.permission == "專案管理員")
      setFetchRoute(`${BASE_URL}/projects/list/${userInfo.user.corporation}`);

    console.log(fetchRoute);
    const fetchProjects = async () => {
      await axios
        .get(fetchRoute, {
          headers: {
            Authorization: `Bearer ` + `${userInfo.token}`,
          },
        })
        .then(async (res) => {
          let projects = await res.data;
          console.log(projects);
          setProjectList(projects);
        })
        .catch((e) => {
          console.error(`List Projects Error: ${e}`);
        });
    };

    if (isFocused) {
      fetchProjects();
    }
  }, [isFocused, userInfo, fetchRoute]);

  const projectAddHandler = async () => {
    navigation.navigate("ProjectAdd", { name: "Create new project" });
  };

  const projectDeleteHandler = async () => {
    Alert.alert("刪除專案", "真的要刪除專案嗎？", [
      {
        text: "取消",
        onPress: () => {
          console.log(projectList);
        },
        style: "cancel",
      },
      {
        text: "確定",
        onPress: async () => {
          await SqliteManager.deleteProject(selectedProjectId);
          setProjectList(projectList.filter((p) => p.id !== selectedProjectId));
        },
        style: "destructive",
      },
    ]);
  };

  const projectEditHandler = async () => {
    let project = await SqliteManager.getProject(selectedProjectId);
    navigation.navigate("ProjectAdd", {
      name: "Create new project",
      project: project,
    });
  };

  const projectSelectHandler = async (item) => {
    // setSelectedProjectId(item.project_id);
    console.log(item);
    await navigation.navigate("IssueList", {
      project: item,
      // project: await SqliteManager.getProject(selectedProjectId),
    });
  };

  const swipeBtns = [
    {
      text: <Ionicons name={"create-outline"} size={24} color={"white"} />,
      backgroundColor: "orange",
      underlayColor: "rgba(0, 0, 0, 1, 0.6)",
      onPress: () => projectEditHandler(),
    },
    {
      text: <Ionicons name={"ios-trash"} size={24} color={"white"} />,
      backgroundColor: "red",
      underlayColor: "rgba(0, 0, 0, 1, 0.6)",
      onPress: () => projectDeleteHandler(),
    },
  ];

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* <Image style={styles.thumbnail} source={{uri: item.thumbnail}} /> */}
        <FastImage
          style={styles.thumbnail}
          source={{
            uri: `${BASE_URL}/projects/get/thumbnail/${item.project_id}`,
          }}
        />
        <Text style={[styles.title, textColor]}>{item.project_name}</Text>
      </View>
      <Ionicons
        style={styles.status}
        name={"ios-ellipse"}
        size={24}
        color={determineStatusColor(item)}
      />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    console.log(item);
    const backgroundColor =
      item.project_id === selectedProjectId ? "white" : "white"; //"darkgrey" : "white";
    const color = item.project_id === selectedProjectId ? "black" : "black"; //'white' : 'black';

    return (
      <React.Fragment>
        <Swipeout
          key={item.project_id}
          right={swipeBtns}
          onOpen={() => setSelectedProjectId(item.project_id)}
        >
          <Item
            item={item}
            key={item.project_id}
            onPress={() => projectSelectHandler(item)}
            backgroundColor={{ backgroundColor }}
            textColor={{ color }}
          />
        </Swipeout>
        <Separator />
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <SafeAreaView style={styles.container}>
        <FlatList
          ListHeaderComponent={<Separator />}
          style={styles.flatList}
          data={projectList}
          renderItem={renderItem}
          keyExtractor={(item) => item.project_id}
          extraData={selectedProjectId}
          ListFooterComponent={
            userInfo.user.permission === "管理員" || userInfo.user.permission === "公司負責人" ? (
              <TouchableOpacity
                onPress={projectAddHandler}
                style={[styles.item]}
              >
                <Text
                  style={[styles.title, { marginTop: 0, color: "dodgerblue" }]}
                >
                  {"新增專案"}
                </Text>
              </TouchableOpacity>
            ) : (
              <></>
            )
          }
        />
      </SafeAreaView>
    </React.Fragment>
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
    width: 250,
    alignSelf: "center",
  },
  status: {
    marginTop: 26,
  },
});

export default ProjectListScreen;
