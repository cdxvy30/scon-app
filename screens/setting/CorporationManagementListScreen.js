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
import axios from 'axios';
import {BASE_URL} from '../../configs/authConfig';

const CorporationManagementListScreen = ({navigation, route}) => {
  const [corporationList, setCorporationList] = useState([]);
  const [projectId, setProjectId] = useState(route.params.project_id);
  const [selectedCorporationId, setSelectedCorporationId] = useState('');
  const isFocused = useIsFocused();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <React.Fragment>
          <Icon
            name="ios-add"
            type="ionicon"
            color="dodgerblue"
            size={30}
            onPress={() => {corporationAddHandler()}}
          />
        </React.Fragment>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    // const fetchWorkItems = async () => {
    //   const workitems = await SqliteManager.getWorkItemsByProjectId(project.id);
    //   const transformedWorkItems = transformWorkItems(workitems);
    //   const sortedWorkItems = transformedWorkItems.sort(
    //     (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    //   );

    //   setWorkItemList(sortedWorkItems);
    //   setProjectId(project.id);
    //   setProject(project)
    // };

    const fetchCorporations = async () => {
      try{
        const res = await axios.get(`${BASE_URL}/corporations/list/${projectId}`);
        setCorporationList(await res.data);
        console.log('Corporation List: \n', res.data);
      }catch(error){
        console.log(`Fetch corporation error: ${error}`);
      }
    };

    if (isFocused) {
      // fetchWorkItems();
      fetchCorporations()
    }
  }, [isFocused]);

  const corporationClickHandler = (item) => {
    setSelectedCorporationId(item.corporation_id)
    route.params.setResponsibleCorporation(item.corporation_name)
    navigation.goBack()
  };

  const corporationAddHandler = async () => {
    navigation.navigate('CorporationAdd', { 
      name: 'Create new corporation' ,
      projectId: projectId
    })};

  const corporationDeleteHandler = async () => {
    Alert.alert(
      "刪除廠商",
      "真的要刪除此廠商嗎？",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "確定", onPress: async () => {
            // await SqliteManager.deleteWorkItem(selectedWorkItemId);
            // setWorkItemList(WorkItemList.filter(i => i.id !== selectedWorkItemId));
          },
          style: "destructive"
        }
      ]
    );
  };

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
    // <Swipeout
    //   backgroundColor='#ffffff'
    //   style={styles.swipeout}
    //   key={item.corporation_id}
    //   right={
    //     [
    //       {
    //         text: <Ionicons name={'ios-trash'} size={24} color={'white'} />,
    //         backgroundColor: 'red',
    //         underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
    //         onPress: () => corporationDeleteHandler(),
    //       }
    //     ]
    //   }
    // >
      <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
        <View style={{width:'85%'}}>
          <Text style={[styles.title, textColor]} ellipsizeMode={'tail'} numberOfLines={1}>
            {item.corporation_name} | {item.corporation_manager} 
          </Text>
          <Text style={[styles.title, textColor]} ellipsizeMode={'tail'} numberOfLines={1}>
            {item.corporation_phone}
          </Text>
          {/* <Text style={[styles.title, textColor]}>{item.user_corporation}</Text>
          <Text style={[styles.title, textColor]}>{item.user_job}</Text> */}
        </View>
      </TouchableOpacity>
    // </Swipeout>
    // <TouchableOpacity
    //   onPress={onPress}
    //   style={[styles.item, backgroundColor]}>
    //   <View style={{ flex: 1, flexDirection: 'row' }}>
    //     <Text style={[styles.title, textColor]}>{`${item.corporation_manager}-${item.corporation_name}`}</Text>
    //   </View>
    // </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === setSelectedCorporationId ? '#600000' : '#ffffff';
    const color = item.id === setSelectedCorporationId ? 'white' : 'black';
    return (
      <React.Fragment>
          <Item
            item={item}
            key={item.id}
            onPress={() => corporationClickHandler(item)}
            backgroundColor={{ backgroundColor }}
            textColor={{ color }}
          />
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <SafeAreaView style={styles.container}>
        <FlatList
          style={styles.flatList}
          data={corporationList}
          renderItem={renderItem}
          keyExtractor={item => item.corporation_id}
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
    padding:10,
  },
  swipeout:{
    borderRadius:20, 
    marginVertical:5,
    borderWidth:1, 
    borderColor:'#BBBBBB'
  },
  item: {
    marginVertical:5,
    padding:20,
    borderRadius:20,
    flex:1,
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center'
  },
  title: {
    marginVertical:1,
    marginLeft: 8,
    fontSize: 20,
  },
});
  
  export default CorporationManagementListScreen;