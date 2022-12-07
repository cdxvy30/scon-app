import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import Swipeout from 'react-native-swipeout';
import Separator from '../../components/Separator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SqliteManager from '../../services/SqliteManager';
import { useIsFocused } from '@react-navigation/native';
import { transformProjects } from '../../util/sqliteHelper';

const determineStatusColor = item => {
  let color = 'grey';
  if(item.status===0)
    color = 'limegreen';
  if(item.status===1)
    color = 'gold';
  if(item.status===2)
    color = 'orangered';

  return color;
};

const ProjectListScreen = ({ navigation }) => {
  const [projectList, setProjectList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchProjects = async () => {
      const projects = await SqliteManager.getAllProjects();  // 改成向遠端主機fetch
      const transformedProjects = transformProjects(projects);
      const sortedProjects = transformedProjects.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );
      setProjectList(sortedProjects);
    };

    if (isFocused) {
      fetchProjects();
    }
  }, [isFocused]);

  const projectAddHandler = async () => {
    navigation.navigate('ProjectAdd', { name: 'Create new project' });
  };

  const projectDeleteHandler = async () => {
    Alert.alert(
      "刪除專案",
      "真的要刪除專案嗎？",
      [
        {
          text: "取消",
          onPress: () => {console.log(projectList)},
          style: "cancel"
        },
        {
          text: "確定", onPress: async () => {
            await SqliteManager.deleteProject(selectedProjectId);
            setProjectList(projectList.filter(p => p.id !== selectedProjectId));
          },
          style: "destructive"
        }
      ]
    );

  };

  const projectEditHandler = async () => {
    let project = await SqliteManager.getProject(selectedProjectId);
    navigation.navigate('ProjectAdd', { name: 'Create new project', project: project });
  };

  const projectSelectHandler = async item => {
    setSelectedProjectId(item.id);
    await navigation.navigate('IssueList', { name: item.title, project: await SqliteManager.getProject(selectedProjectId) });
  };

  const swipeBtns = [
    {
      text: <Ionicons name={'create-outline'} size={24} color={'white'} />,
      backgroundColor: 'orange',
      underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
      onPress: () => projectEditHandler(),
    },
    {
      text: <Ionicons name={'ios-trash'} size={24} color={'white'} />,
      backgroundColor: 'red',
      underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
      onPress: () => projectDeleteHandler(),
    }
  ];

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <Swipeout
      key={item.id}
      right={swipeBtns}
      onOpen={() => setSelectedProjectId(item.id)}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.item, backgroundColor]}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Image style={styles.thumbnail} source={{ uri: item.thumbnail }} />
          <Text style={[styles.title, textColor]}>{item.title}</Text>
        </View>
        <Ionicons
          style={styles.status}
          name={'ios-ellipse'}
          size={24}
          color={determineStatusColor(item)}
        />
      </TouchableOpacity>
    </Swipeout>
  );

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedProjectId ? 'white' : 'white'; //"darkgrey" : "white";
    const color = item.id === selectedProjectId ? 'black' : 'black'; //'white' : 'black';

    return (
      <React.Fragment>
        <Item
          item={item}
          ket={item.id}
          onPress={() => projectSelectHandler(item)}
          backgroundColor={{ backgroundColor }}
          textColor={{ color }}
        />
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
          keyExtractor={item => item.id}
          extraData={selectedProjectId}
          ListFooterComponent={
            <TouchableOpacity onPress={projectAddHandler} style={[styles.item]}>
              <Text style={[styles.title, { marginTop: 0, color: 'dodgerblue' }]}>
                {'新增專案'}
              </Text>
            </TouchableOpacity>
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
    height: 'auto',
  },
  item: {
    padding: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginTop: 26,
    fontSize: 24,
  },
  status: {
    marginTop: 26,
  },
});

export default ProjectListScreen;
