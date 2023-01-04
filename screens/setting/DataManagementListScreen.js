import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import Separator from '../../components/Separator';
import SqliteManager from '../../services/SqliteManager';
import {OBJECT_TYPE} from '../../configs/objectTypeConfig';

const DataManageListScreen = ({navigation}) => {
  const [projectList, setProjectList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      const projects = await SqliteManager.getAllProjects();
      setProjectList(projects);
    };
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  projectListClickHandler = () => {
    var options = projectList.map(item => item.name);
    options.push('取消');
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: options,
        cancelButtonIndex: options.length - 1,
        userInterfaceStyle:'light',
      },
      async (buttonIndex) => {
        if (buttonIndex == options.length - 1) {
          return;
        } else {
          setSelectedProjectId(projectList[buttonIndex].id);
          await navigation.navigate('DataManage', { name: projectList[buttonIndex].name, project: await SqliteManager.getProject(selectedProjectId) });
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
                  <Ionicons style={styles.titleIcon} name={'ios-pricetags'} />{' '}
                  專案
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.description}>
                    {' '}
                    {projectList.length}個{' '}
                  </Text>
                </View>
              </View>
            {projectList.length > 0 ? (
              <React.Fragment>
                <Separator />
                <Text style={[styles.description, {marginVertical: 12}]} ellipsizeMode={'tail'} numberOfLines={1}>
                  {projectList.map(o => `${o.name}  `)}
                </Text>
              </React.Fragment>
            ) : undefined}
            </TouchableOpacity>
          </View>
          <View style={styles.group}>
            <TouchableOpacity onPress={() => {}}>
              <View style={styles.item}>
                <Text style={styles.title}>
                  <Ionicons style={styles.titleIcon} name={'ios-pricetags'} />{' '}
                  標籤
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.description}>
                    {' '}
                    {OBJECT_TYPE.length}個{' '}
                  </Text>
                </View>
              </View>
            {OBJECT_TYPE.length > 0 ? (
              <React.Fragment>
                <Separator />
                <Text style={[styles.description, {marginVertical: 12}]}>
                  {OBJECT_TYPE.map(o => `${o.name} `)}
                </Text>
              </React.Fragment>
            ) : undefined}
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
