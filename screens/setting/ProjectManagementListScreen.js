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
      await navigation.navigate('ProjectManagement', {
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
        <View style={{width:'77%'}}>
          <Text style={[styles.title, textColor]} ellipsizeMode={'tail'} numberOfLines={1}>
            {item.project_name}
          </Text>
          <Separator />
          <Text style={[styles.title, textColor]} ellipsizeMode={'tail'} numberOfLines={1}>
            {item.project_manager ? item.project_manager : '未分配專案管理員'}
          </Text>
        </View>
        {item.project_manager ?
          <Image
            style={styles.icon}
            source={require('../../configs/check_mark.png')}
          />
          :
          <Image
            style={styles.icon}
            source={require('../../configs/question_mark.png')}
          />
        }
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const backgroundColor =
      item.id === setSelectedProjectId ? "#600000" : "#ffffff";
    const color = item.id === setSelectedProjectId ? 'white' : 'black';

    return (
      <View>
        <Item
          item={item}
          onPress={() => ProjectManagementHandler(item)}
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
    padding:10
  },
  icon: {
    width: 70,
    height: 70,
    borderRadius: 70 / 2,
    borderColor: 'black',
    borderWidth: 2,
  },
  item: {
    marginVertical:5,
    padding:10,
    borderRadius:20,
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  title: {
    marginVertical:2,
    marginLeft: 8,
    fontSize: 22,
    textAlign:'left'
  },
});

export default ProjectManagementListScreen;
