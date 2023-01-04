import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Separator from '../../components/Separator';
import SqliteManager from '../../services/SqliteManager';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Icon } from 'react-native-elements';
import { useIsFocused } from '@react-navigation/native';
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

const WorkItemListScreen = ({navigation, route}) => {
  const [WorkItemList, setWorkItemList] = useState(null);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState(null);
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
            onPress={() => {workItemAddHandler()}}
          />
        </React.Fragment>

      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchWorkItems = async () => {
      const workitems = await SqliteManager.getWorkItemsByProjectId(project.id);
      const transformedWorkItems = transformWorkItems(workitems);
      const sortedWorkItems = transformedWorkItems.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );

      setWorkItemList(sortedWorkItems);
      setProjectId(project.id);
      setProject(project)
    };

    if (isFocused) {
      fetchWorkItems();
    }
  }, [isFocused]);

  const workItemAddHandler = async () => {
    navigation.navigate('CorporationAdd', { 
      name: 'Create new corporation' ,
      projectId: projectId
    })};

  const workItemDeleteHandler = async () => {
    Alert.alert(
      "刪除工項",
      "真的要刪除工項嗎？",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "確定", onPress: async () => {
            await SqliteManager.deleteWorkItem(selectedWorkItemId);
            setWorkItemList(WorkItemList.filter(i => i.id !== selectedWorkItemId));
          },
          style: "destructive"
        }
      ]
    );
  };

  const workItemEditHandler = item => {
    setSelectedWorkItemId(item.id);
    navigation.navigate('CorporationAdd', { 
      action: 'update existing corporation',
      projectId: projectId,
      item, });
  };

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.item, backgroundColor]}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Text style={[styles.title, textColor]}>{`${item.name}-${item.company}`}</Text>
        </View>
      </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedWorkItemId ? 'white' : 'white'; //"darkgrey" : "white";
    const color = item.id === selectedWorkItemId ? 'black' : 'black'; //'white' : 'black';
    return (
      <React.Fragment>
        <Swipeout
        key={item.id}
        right={
          [
            {
              text: <Ionicons name={'ios-trash'} size={24} color={'white'} />,
              backgroundColor: 'red',
              underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
              onPress: () => workItemDeleteHandler(),
            }
          ]
        }
        onOpen={() => setSelectedWorkItemId(item.id)}>
          <Item
            item={item}
            ket={item.id}
            onPress={() => workItemEditHandler(item)}
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
          data={WorkItemList}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          extraData={selectedWorkItemId}
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
    padding: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginVertical: 8,
    // marginHorizontal: 16,
  },
  title: {
    marginLeft: 12,
    marginTop: 20,
    fontSize: 24,
  },
});
  
  export default WorkItemListScreen;