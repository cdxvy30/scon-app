import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Separator from '../../components/Separator';
import SqliteManager from '../../services/SqliteManager';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { transformWorkItems } from '../../util/sqliteHelper';
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

const IssueLocationListScreen = ({navigation, route}) => {
  const [issueLocationList, setIssueLocationList] = useState(null);
  const [projectId, setProjectId] = useState(route.params.projectId);
  const [project, setProject] = useState(route.params.project);
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
                  }else{
                    route.params.setIssueLocationText(location);
                    navigation.goBack();
                    await SqliteManager.createIssueLocation({
                      project_id: projectId,
                      location: location,
                    });
                  }

                },
              )
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
  }, [navigation]);

  useEffect(() => {
    const fetchIssueLocations = async () => {
      const issuelocations = await SqliteManager.getIssueLocationsByProjectId(project.id);
      const sortedIssuelocations = issuelocations.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );
      
      issueLocationList?issueLocationList:setIssueLocationList(sortedIssuelocations);
      setProjectId(project.id);
      setProject(project)
    };

    if (isFocused) {
      fetchIssueLocations();
    }
  }, [isFocused]);

  const issueLocationSelectHandler = item => {
    route.params.setIssueLocationText(item.location);
    navigation.goBack();
  };

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.item, backgroundColor]}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Text style={[styles.title, textColor]}>{item.location}</Text>
        </View>
      </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const backgroundColor = 'white'; 
    const color = 'black' ; 
    return (
      <React.Fragment>
        <Item
          item={item}
          key={item.id}
          onPress={() => issueLocationSelectHandler(item)}
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
          data={issueLocationList}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onDragEnd={({ data }) => setIssueLocationList(data)}
        />
      </SafeAreaView>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  flatList: {
    height: 'auto',
  },
  item: {
    height:70,
    padding: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginVertical: 8,
    // marginHorizontal: 16,
  },
  title: {
    fontSize: 24,
    alignItems:'center',
  },
});
  
export default IssueLocationListScreen;
