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

const ProjectManagementListScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);
  const [projectList, setProjectList] = useState([]);
  const [fetchRoute, setFetchRoute] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (userInfo.user.permission === '管理員') {
      setFetchRoute(`${BASE_URL}/projects/list/all`);
    } else if (userInfo.user.permission === '公司負責人') {
      setFetchRoute(`${BASE_URL}/projects/list/${userInfo.user.corporation}`);
    }

    console.log(fetchRoute);

    const fetchProjects = () => {
      axios
        .get(fetchRoute, {
          headers: {
            Authorization: `Bearer ` + `${userInfo.token}`,
          },
        })
        .then(async (res) => {
          let projects = await res.data;
          setProjectList(projects);
        })
        .catch((e) => {
          console.log(`List projects error: ${e}`);
        });
    };
    if (isFocused) {
      fetchProjects();
    }
  }, [isFocused, userInfo, fetchRoute]);

  const ProjectManagementHandler = async (project) => {
    setSelectedProjectId(project.project_id);
    console.log(project);
    try {
      await navigation.navigate('ProjectManagementScreen', {
        project_id: project.project_id,
        project_name: project.project_name,
        project_corporation: project.project_corporation,
      });
    } catch (error) {
      console.log(`Navigate to Project Management error: ${error}`);
    }
  };

  const Item = ({item, onPress, backgroundColor, textColor}) => {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
        <Text style={[styles.title, textColor]}>
          {item.project_name} | {item.project_manager ? item.project_manager : '未分配專案管理員'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const backgroundColor =
      item.id === setSelectedProjectId ? "#600000" : "#ffffff";
    const color = item.id === setSelectedProjectId ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => ProjectManagementHandler(item)}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={projectList}
        renderItem={renderItem}
        keyExtractor={(item) => item.project_id}
        extraData={selectedProjectId}
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

export default ProjectManagementListScreen;
