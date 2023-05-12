import React, { useEffect, useState, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import Separator from '../../components/Separator';
import SqliteManager from '../../services/SqliteManager';
import {OBJECT_TYPE} from '../../configs/objectTypeConfig';
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from '../../configs/authConfig';
import axios from 'axios';

const DataManageListScreen = ({navigation}) => {
  const [projectList, setProjectList] = useState([]);
  const [fetchRoute, setFetchRoute] = useState([]);
  const isFocused = useIsFocused();
  const { showActionSheetWithOptions } = useActionSheet();
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    if (userInfo.user.permission == "管理員")
      setFetchRoute(`${BASE_URL}/projects/all`);
    else if (userInfo.user.permission == "公司負責人")
      setFetchRoute(`${BASE_URL}/projects/${userInfo.user.corporation}`);
    else if (userInfo.user.permission == "專案管理員")  // 要改成從works_on fetch
      setFetchRoute(`${BASE_URL}/projects/works_on/${userInfo.user.uuid}`);

    const fetchProjects = async () => {
      await axios({
        methods: 'get',
        url: `${fetchRoute}`,
        headers: {
          Authorization: `Bearer ` + `${userInfo.token}`,
        }
      })
      .then(async (res) => {
        let projects = await res.data;
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

  projectListClickHandler = () => {
    var options = [...projectList.map(item => item.project_name), '取消'];
    showActionSheetWithOptions(
      {
        options: options,
        cancelButtonIndex: options.length - 1,
        userInterfaceStyle:'light',
      },
      async (buttonIndex) => {
        if (buttonIndex == options.length - 1) {
          return;
        } else {
          await navigation.navigate('DataManagement', {
            name: projectList[buttonIndex].project_name, 
            project: projectList[buttonIndex] 
          });
        }
      },
    );
  };

  return (
    <React.Fragment>
      <SafeAreaView>
        <ScrollView style={styles.scrollView}>
          <View style={styles.group}>
            <TouchableOpacity onPress={projectListClickHandler}>
              <View style={styles.item}>
                <Text style={styles.title}>
                  <Ionicons style={styles.titleIcon} name={'ios-server-outline'} />{' '}
                  專案
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.description}>
                    {' '}
                    {projectList.length}個{' '}
                  </Text>
                </View>
              </View>
            {projectList.length > 0 ? 
              <View>
                <Separator />
                <Text style={[styles.description, {marginVertical: 12}]} ellipsizeMode={'tail'} numberOfLines={1}>
                  {projectList.map(project => `${project.project_name}  `)}
                </Text>
              </View>
              : 
              undefined
            }
            </TouchableOpacity>
          </View>
          <View style={styles.group}>
            <TouchableOpacity onPress={() => {}}>
              <View style={styles.item}>
                <Text style={styles.title}>
                  <Ionicons style={styles.titleIcon} name={'ios-pricetags-outline'} />{' '}
                  標籤
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.description}>
                    {' '}
                    {OBJECT_TYPE.length}個{' '}
                  </Text>
                </View>
              </View>
            {OBJECT_TYPE.length > 0 ? 
              <View>
                <Separator />
                <Text style={[styles.description, {marginVertical: 12}]}>
                  {OBJECT_TYPE.map(o => `${o.name} `)}
                </Text>
              </View>
              : 
              undefined
            }
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    paddingVertical: 20,
  },
  header: {
    fontSize: 42,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
  },
  image: {
    // width: '100%',
    height: 400,
    marginBottom: 15,
  },
  group: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 20,
  },
  item: {
    paddingVertical: 15,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
  },
  titleIcon: {
    fontSize: 18,
  },
  description: {
    fontSize: 18,
    color: 'gray',
  },
});

export default DataManageListScreen;
