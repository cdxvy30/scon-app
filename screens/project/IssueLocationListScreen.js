import React, {useState, useRef, useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import {
  SafeAreaView,
  ScrollView,
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
  //預想是fetch出floor和position
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

  const renderHeader = (section, _, isActive) => {
    return(
      <View>
        <Animatable.View
        duration = {400}
        style = {[styles.header, isActive ? styles.header_active : styles.header]}>
          <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
            <Ionicons
            style={{color: 'dodgerblue', fontSize: 40}}
            name={'pin-outline'}
            />
            <Text style = {[styles.headerText, isActive ? styles.headerText_active : styles.headerText]}> {section.title}</Text>
          </View>
          {isActive?
            <Ionicons
            style={{color: 'dodgerblue', fontSize: 30}}
            name={'chevron-down-outline'}
            />
            :
            <Ionicons
            style={{color: 'dodgerblue', fontSize: 30}}
            name={'ios-chevron-forward'}
            />
          }
        </Animatable.View>
      </View>
      
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
              <Ionicons
                style={{color: 'dodgerblue', fontSize: 40}}
                name={'location-outline'}
              />
              <Animatable.Text
              animation = {isActive ? 'bounceIn' : undefined}
              style = {styles.contentText}>
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
    padding:20,
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
    marginVertical:5,
    backgroundColor:'#FFFFFF',
    justifyContent:'space-between',
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    borderRadius:15,
    borderWidth:1,
    padding:10
  },
  headerText:{
    fontSize: 26,
    fontWeight: '400',
  },
  headerText_active:{
    fontSize: 26,
    fontWeight: '400',
    color:'#FFFFFF'
  },
  content:{
    flex:0,
    flexDirection:'row',
    alignItems:'center',
    paddingVertical:5,
    marginHorizontal:30,
  },
  contentText:{
    color:'#727272',
    fontSize:20,
  },
  header_active:{
    backgroundColor:'#A9A9A9',
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
