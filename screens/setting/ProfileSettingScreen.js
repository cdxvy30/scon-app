import React from 'react';
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
import Separator from '../../components/Separator';
import {OBJECT_TYPE} from '../../configs/objectTypeConfig';




const ProfileSettingScreen = () => {
 
  return (
    <React.Fragment>
      <SafeAreaView>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.header}>設定</Text>
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
            </TouchableOpacity>
            {OBJECT_TYPE.length > 0 ? (
              <React.Fragment>
                <Separator />
                <Text style={[styles.description, {marginVertical: 12}]}>
                  {OBJECT_TYPE.map(o => `${o.name} `)}
                </Text>
              </React.Fragment>
            ) : undefined}
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

export default ProfileSettingScreen;
