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
import axios from 'axios';
import {BASE_URL} from '../../configs/authConfig';

const DataManageScreen = ({navigation, route}) => {
  const [project, setProject] = useState(route.params.project);
  const [corporationList, setCorporationList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchCorporations = async () => {
      // 等資料庫建責任廠商的table
      // const corporations = await SqliteManager.getWorkItemsByProjectId(project.id);
      // setCorporationList(corporations);
    };

    const fetchLocations = async () => {
      await axios
        .get(`${BASE_URL}/locations/list/${project.project_id}`)
        .then(async (res) => {
          let locations = await res.data;
          setLocationList(locations);
        })
        .catch((e) => {
          console.log(`list locations error: ${e}`);
        });
    };

    if (isFocused) {
      fetchCorporations();
      fetchLocations();
    }
  }, [route.params.name, isFocused]);

  corporationClickHandler = () => {
    navigation.navigate(
      'CorporationManagementList', {
        project: project,
      }
    )
  }

  locationClickHandler = () => {
    navigation.navigate(
      'LocationManagement', {
        project: project,
      }
    )
  }

  return (
    <React.Fragment>
      <SafeAreaView>
        <ScrollView style={styles.scrollView}>
          <View style={styles.group}>
            <TouchableOpacity onPress={corporationClickHandler}>
              <View style={styles.item}>
                <Text style={styles.title}>
                  <Ionicons style={styles.titleIcon} name={'ios-build-outline'} />{' '}
                  廠商
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.description}>
                    {' '}
                    {corporationList.length}個{' '}
                  </Text>
                </View>
              </View>
            {corporationList.length > 0 ? (
              <React.Fragment>
                <Separator />
                <Text style={[styles.description, {marginVertical: 12}]} ellipsizeMode={'tail'} numberOfLines={1}>
                  {corporationList.map(o => `${o.company}  `)}
                </Text>
              </React.Fragment>
            ) : undefined}
            </TouchableOpacity>
          </View>
          <View style={styles.group}>
            <TouchableOpacity onPress={locationClickHandler}>
              <View style={styles.item}>
                <Text style={styles.title}>
                  <Ionicons style={styles.titleIcon} name={'ios-location-outline'} />{' '}
                  地點
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.description}>
                    {' '}
                    {locationList.length}個{' '} 
                  </Text>
                </View>
              </View>
            {locationList.length > 0 ? (
              <React.Fragment>
                <Separator />
                <Text style={[styles.description, {marginVertical: 12}]} ellipsizeMode={'tail'} numberOfLines={1}>
                  {locationList.map(o => `${o.floor}${o.position}   `)}
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

export default DataManageScreen;
