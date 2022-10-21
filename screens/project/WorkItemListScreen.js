import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Separator from '../../components/Separator';
import SqliteManager from '../../services/SqliteManager';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchWorkItems = async () => {
      const workitems = await SqliteManager.getAllWorkItem();
      const transformedWorkItems = transformWorkItems(workitems);
      
      setWorkItemList(transformedWorkItems);
    };

    if (isFocused) {
      fetchWorkItems();
    }
  }, [isFocused]);

  const workItemAddHandler = async () => {
    navigation.navigate('WorkItemAdd', { name: 'Create new workitem'});
  };

  

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
    navigation.navigate('WorkItemAdd', { 
      action: 'update existing workitem',
      item, });
  };



  const workItemSelectHandler = item => {
    route.params.setIssueTaskText(item.name);
    route.params.setIssueAssigneeText(`${item.company}-${item.manager}`);
    route.params.setIssueAssigneePhoneNumberText(item.phone_number);
    navigation.goBack();
  };

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <Swipeout
      key={item.id}
      right={[
        {
          text: <Ionicons name={'create-outline'} size={24} color={'white'} />,
          backgroundColor: 'orange',
          underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
          onPress: () =>{workItemEditHandler(item)}
        },
        {
          text: <Ionicons name={'ios-trash'} size={24} color={'white'} />,
          backgroundColor: 'red',
          underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
          onPress: () => workItemDeleteHandler(),
        }
      ]}
      onOpen={() => setSelectedWorkItemId(item.id)}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.item, backgroundColor]}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Text style={[styles.title, textColor]}>{`${item.name}-${item.company}`}</Text>
        </View>
      </TouchableOpacity>
    </Swipeout>
  );

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedWorkItemId ? 'white' : 'white'; //"darkgrey" : "white";
    const color = item.id === selectedWorkItemId ? 'black' : 'black'; //'white' : 'black';
    return (
      <React.Fragment>
        <Item
          item={item}
          ket={item.id}
          onPress={() => workItemSelectHandler(item)}
          backgroundColor={{ backgroundColor }}
          textColor={{ color }}
        />
        <Separator />
      </React.Fragment>
    );
  };
  //issueList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  //setIssueList([...issueList]);
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
          ListFooterComponent={
            <TouchableOpacity onPress={workItemAddHandler} style={[styles.item]}>
              <Text style={[styles.title, { marginTop: 0, color: 'dodgerblue' }]}>
                {'新增工項'}
              </Text>
            </TouchableOpacity>
          }
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