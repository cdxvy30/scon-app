import React, {useState, useRef, useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';
import {Button, Icon} from 'react-native-elements';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BASE_URL} from '../../configs/authConfig';
import axios from 'axios';
import * as Animatable from 'react-native-animatable'
import Collapsible from 'react-native-collapsible';
import Accordion from 'react-native-collapsible/Accordion'

const windowSize = Dimensions.get('window')

const LocationManagementScreen = ({navigation, route}) => {
  const project = route.params.project;
  const [issueLocationList, setIssueLocationList] = useState(null);
  const isFocused = useIsFocused();
  const [activeSections, setActiveSections] = useState([]);
  const [CONTENT, setCONTENT] = useState([]);
  let projectId = project.project_id

  const issueLocationAddHandler = async () => {
    navigation.navigate('IssueLocationAdd', { 
      name: 'Create new issue location' ,
      projectId: projectId,
    })};
  

  const renderHeader = (section, _,) => {
    return(
      <View>
        <Animatable.View
        duration = {400}
        style = {styles.header}>
          <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
            <Ionicons
            style={{color: 'dodgerblue', fontSize: 40}}
            name={'pin-outline'}
            />
            <Text style = {styles.headerText}> {section.title}</Text>
          </View> 
          <Ionicons
            style={{color: 'red', fontSize: 40}}
            name={'ios-remove-circle'}
            onPress={()=>{}} //Alert然後從database delete （樓層下所有位置都delete）
          />
        </Animatable.View>
      </View>
    )
  }

  const renderContent = (section, _, isActive) => {
    return(
      <View>
        {section.content.map((item)=> (
            <Animatable.View
            duration = {400}
            style = {styles.content}
            >
              <View style = {styles.contentItem}>
                <Ionicons
                  style={{color: 'dodgerblue', fontSize: 40}}
                  name={'location-outline'}
                />
                <Animatable.Text
                animation = {isActive ? 'bounceIn' : undefined}
                style = {styles.contentText}>
                  {item}
                </Animatable.Text>
              </View>
              <Ionicons
                style={{color: 'red', fontSize: 40}}
                name={'ios-remove-circle-outline'}
                onPress={()=>{}}    //Alert然後從database delete
              />
            </Animatable.View>
        ))}
      </View>
    )
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <React.Fragment>
          <Icon
            name="ios-add"
            type="ionicon"
            color="dodgerblue"
            size={30}
            onPress={() => {issueLocationAddHandler()}}
          />      
        </React.Fragment>
      ),
    });
  }, [navigation, projectId, route.params]);

  useEffect(() => {
    console.log('/// fetching location data ///')
    const fetchIssueLocations = async () => {
      await axios
        .get(`${BASE_URL}/locations/list/${projectId}`)
        .then(async (res) => {
          let locations = await res.data;

          let alpha = [], num = []; //缺失地點排序
          const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
          locations.map( (location) => {
            if( parseInt(location.floor[0]) == location.floor[0]) {
              num.push(location);
            }            
            else {
              alpha.push(location);
            }
          });
          let sortedLocations = [...alpha.sort((a, b) => collator.compare(b.floor, a.floor)), ...num.sort((a, b) => collator.compare(a.floor, b.floor))];
          setIssueLocationList(sortedLocations);

          const tmp_content = sortedLocations.map((location)=>location.floor)
          .map((floor, index) => ({
              title: floor, 
              content: [sortedLocations.map((location)=>location.position)[index]]
          }));

          const final_content = [];
          tranformContent = () => {
            tmp_content.forEach((item) => {
              if (final_content.map(option => option.title).includes(item.title)){
                final_content[final_content.map(option => option.title).indexOf(item.title)].content.push(item.content)
              } else {
                final_content.push(item)
              }
            })
            return(final_content)
          }
          setCONTENT(await tranformContent())  
        })
        .catch((e) => {
          console.log(`list locations error: ${e}`);
        });
    };

    if (isFocused) {
      fetchIssueLocations();
    }
  }, [isFocused, projectId]);

  return (
    <React.Fragment>
      <SafeAreaView style={{flex:1}}>
        <View style={styles.container}>
          <ScrollView>
            <Accordion
              activeSections={activeSections}
              sections={CONTENT}
              touchableComponent={TouchableOpacity}
              renderHeader={renderHeader}
              renderContent={renderContent}
              onChange={setActiveSections}
              duration={400}
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
    padding: windowSize.height*0.02,
  },
  flatList: {
    height: 'auto',
  },
  header:{
    marginVertical: windowSize.height*0.01,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#BBBBBB',
    padding: windowSize.height*0.01
  },
  headerText:{
    fontSize: windowSize.height*0.033,
    fontWeight: '400',
  },
  content:{
    flex:0,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingVertical: windowSize.height*0.01,
    marginHorizontal: windowSize.width*0.07,
    height: windowSize.height*0.08,
  },
  contentItem:{
    flex:0,
    flexDirection:'row',
    alignItems:'center',
  },
  contentText:{
    color:'#727272',
    fontSize: windowSize.height*0.025,
  },
});

export default LocationManagementScreen;
