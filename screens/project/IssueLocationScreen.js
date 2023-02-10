import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';
import Separator from '../../components/Separator';
import SqliteManager from '../../services/SqliteManager';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {transformWorkItems} from '../../util/sqliteHelper';
import Swipeout from 'react-native-swipeout';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BASE_URL} from '../../configs/authConfig';
import axios from 'axios';

const IssueLocationListScreen = ({navigation, route}) => {
  // console.log(route.params);
  const sourceProject = route.params.project;
  // console.log('Source Project');
  // console.log(sourceProject);
  const projectId = sourceProject.project_id;
  const [issueLocationList, setIssueLocationList] = useState(null);
  // const [projectId, setProjectId] = useState(route.params.projectId);
  const [project, setProject] = useState(route.params.project); // 用不到
  // const [projectId, setProjectId] = useState(sourceProject.project_id);
  const isFocused = useIsFocused();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <React.Fragment>
          <Icon
            style={{marginRight: 10}}
            name="ios-add"
            type="ionicon"
            color="dodgerblue"
            size={30}
            onPress={() => {
              Alert.prompt(
                '請輸入缺失位置',
                '(如: 2F西側)',
                async (location) => {
                  if (location == '') {
                    Alert.alert('未填寫任何位置');
                  } else {
                    route.params.setIssueLocationText(location);
                    axios
                      .post(`${BASE_URL}/locations/add`, {
                        location,
                        projectId,
                      })
                      .then(async (res) => {
                        console.log(res.data);
                      })
                      .catch((e) => {
                        console.log(e);
                      });
                    navigation.goBack();
                  }
                },
              );
            }}
          />
          <Icon
            name="ios-ellipsis-horizontal-outline"
            type="ionicon"
            color="dodgerblue"
            size={25}
            onPress={() => {}}
          />
        </React.Fragment>
      ),
    });
  }, [navigation, projectId, route.params]);

  useEffect(() => {
    // const fetchIssueLocations = async () => {
    //   const issuelocations = await SqliteManager.getIssueLocationsByProjectId(
    //     project.id,
    //   );
    //   const sortedIssuelocations = issuelocations.sort(
    //     (a, b) => new Date(a.created_at) - new Date(b.created_at),
    //   );

    //   issueLocationList
    //     ? issueLocationList
    //     : setIssueLocationList(sortedIssuelocations);
    //   setProjectId(project.id);
    //   setProject(project);
    // };

    const fetchIssueLocations = async () => {
      await axios
        .get(`${BASE_URL}/locations/list/${projectId}`)
        .then(async (res) => {
          let data = await res.data;
          setIssueLocationList(data);
        })
        .catch((e) => {
          console.log(`list locations error: ${e}`);
        });
    };

    if (isFocused) {
      fetchIssueLocations();
    }
  }, [isFocused, project, projectId]);

  const issueLocationSelectHandler = (item) => {
    console.log(item);
    route.params.setIssueLocationText(item.location_name);
    navigation.goBack();
  };

  const Item = ({item, onPress, backgroundColor, textColor}) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <Text style={[styles.title, textColor]}>{item.location_name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const backgroundColor = 'white';
    const color = 'black';
    return (
      <React.Fragment>
        <Item
          item={item}
          key={item.id}
          onPress={() => issueLocationSelectHandler(item)}
          backgroundColor={{backgroundColor}}
          textColor={{color}}
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
          data={issueLocationList}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onDragEnd={({data}) => setIssueLocationList(data)}
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
    height: 70,
    padding: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginVertical: 8,
    // marginHorizontal: 16,
  },
  title: {
    fontSize: 24,
    alignItems: 'center',
  },
});

export default IssueLocationListScreen;
