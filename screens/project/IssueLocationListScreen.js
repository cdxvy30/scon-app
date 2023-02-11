import React, {useState, useRef, useEffect} from 'react';
import Separator from '../../components/Separator';
import SqliteManager from '../../services/SqliteManager';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {transformWorkItems} from '../../util/sqliteHelper';
import Swipeout from 'react-native-swipeout';
import {
  Animated,
  Alert,
  FlatList,
  SafeAreaView,
  Switch,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BASE_URL} from '../../configs/authConfig';
import axios from 'axios';
import * as Animatable from 'react-native-animatable'
import Collapsible from 'react-native-collapsible';
import Accordion from 'react-native-collapsible/Accordion'
import { duration } from 'moment';

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

  const issueLocationAddHandler = async () => {
    navigation.navigate('IssueLocationAdd', { 
      name: 'Create new issue location' ,
      projectId: projectId
    })};

  //以下實驗用
  const [activeSections, setActiveSections] = useState([]);
  const [collapsed, setCollapsed] = useState(true)
  const toggleExpand = () => {
    setCollapsed(!collapsed);
  }

  const CONTENT = [
    {
      title: '1F',
      content: ['1F_position','1F_position_2']
    },
    {
      title: '2F',
      content: ['2F_position']
    },
    {
      title: '3F',
      content: ['3F_position']
    },
    {
      title: '4F',
      content: ['4F_position']
    },{
      title: '5F',
      content: ['5F_position']
    },
    {
      title: '6F',
      content: ['6F_position']
    },
    {
      title: '7F',
      content: ['7F_position']
    },
    {
      title: '8F',
      content: ['8F_position']
    },{
      title: '9F',
      content: ['9F_position']
    },
    {
      title: '10F',
      content: ['10F_position']
    },
    {
      title: '11F',
      content: ['11F_position']
    },
    {
      title: '12F',
      content: ['12F_position']
    }
  ]

  // const SELECTORS = [
  //   {title: '1F', value: 0},
  //   {title: '2F', value: 1},
  //   {title: '3F', value: 2},
  //   {title: '4F', value: 3},
  //   {title: '5F', value: 4},
  //   {title: '6F', value: 5},
  //   {title: '7F', value: 6},
  //   {title: '8F', value: 7},
  //   {title: '9F', value: 8},
  //   {title: '10F', value: 9},
  //   {title: '11F', value: 10},
  //   {title: '12F', value: 11},
  // ]

  const renderHeader = (section, _, isActive) => {
    return(
      <Animatable.View
      duration = {400}
      style = {[styles.header, isActive ? styles.header_active : styles.header]}>
        <Text style = {styles.headerText}> {section.title}</Text>
      </Animatable.View>
    )
  }

  const renderContent = (section, _, isActive) => {
    return(
      <View>
        {section.content.map((item)=> (
            <TouchableOpacity onPress={() => {issueLocationSelectHandler(section,item)}}>
            <Animatable.View
            duration = {400}
            style = {[styles.content, isActive ? styles.content_active : styles.content]}
            >
              <Animatable.Text
              animation = {isActive ? 'bounceIn' : undefined}
              style = {{textAlign:'center'}}>
                {item}
              </Animatable.Text>
            </Animatable.View>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  //以上實驗用
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
            onPress={() => {issueLocationAddHandler()}}
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
    const fetchIssueLocations = async () => {
      await axios
        .get(`${BASE_URL}/locations/list/${projectId}`)
        .then(async (res) => {
          let data = await res.data;
          setIssueLocationList(data);
          console.log(data)
        })
        .catch((e) => {
          console.log(`list locations error: ${e}`);
        });
    };

    if (isFocused) {
      fetchIssueLocations();
    }
  }, [isFocused, project, projectId]);

  const issueLocationSelectHandler = (floor, position) => {
    route.params.setIssueLocationText(`${floor.title}${position}`);
    navigation.goBack();
  };

  // const Item = ({item, onPress, backgroundColor, textColor}) => (
  //   <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
  //     <View style={{flex: 1, flexDirection: 'row'}}>
  //       <Text style={[styles.title, textColor]}>{item.location_name}</Text>
  //     </View>
  //   </TouchableOpacity>
  // );

  // const renderItem = ({ item }) => {
  //   const backgroundColor = 'white';
  //   const color = 'black';
  //   return (
  //     <React.Fragment>
  //       <Item
  //         item={item}
  //         key={item.id}
  //         onPress={() => issueLocationSelectHandler(item)}
  //         backgroundColor={{backgroundColor}}
  //         textColor={{color}}
  //       />
  //       <Separator />
  //     </React.Fragment>
  //   );
  // };

  return (
    <React.Fragment>
      <SafeAreaView style={{flex:1}}>
        <View style={styles.container}>
          {/* <FlatList
            ListHeaderComponent={<Separator />}
            style={styles.flatList}
            data={issueLocationList}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            onDragEnd={({data}) => setIssueLocationList(data)}
          /> */}

          {/* <ScrollView horizontal={true}>
            <View style={styles.selectors}>
              {SELECTORS.map((selectors) => (
                <TouchableOpacity
                key = {selectors.title}
                onPress = {() => setActiveSections([selectors.value])}
                >
                  <View style={styles.selectors_options}>
                    <Text
                    style = {activeSections.includes(selectors.value) &&
                    styles.activeSelector}>
                      {selectors.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView> */}
          <ScrollView>
            <Accordion
            activeSections = {activeSections}
            sections = {CONTENT}
            touchableComponent = {TouchableOpacity}
            renderHeader = {renderHeader}
            renderContent = {renderContent}
            duration = {400}
            onChange = {setActiveSections}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: StatusBar.currentHeight || 0,
    backgroundColor:'#F5FCFF',
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
    // fontSize: 24,
    // alignItems: 'center',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '300',
    marginTop: 20,
  },
  header:{
    backgroundColor:'#D9D9D9',
    padding:20
  },
  headerText:{
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  content:{
    padding:20,
    backgroundColor:'#fff',
  },
  header_active:{
    backgroundColor:'#A9A9A9'
  },
  content_active:{

  },
  selectors:{
    flex:1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectors_options:{
    paddingHorizontal:30,
    height:40,
    borderWidth:1,
    borderStyle:'solid',
  },
  activeSelector:{
    fontWeight: 'bold',
    fontSize: 26
  },
});

export default IssueLocationListScreen;
