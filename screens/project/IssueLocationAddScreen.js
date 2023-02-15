import React, {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Button} from 'react-native-elements';
import Separator from '../../components/Separator';
import axios from 'axios';
import {BASE_URL} from '../../configs/authConfig';

const IssueLocationAddScreen = ({navigation, route}) => {
  const [floor, setFloor] = useState('');
  const [position, setPosition] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.name}>請輸入以下資訊</Text>
      <View style={styles.wrapper}>
        <View style={styles.item}>
          <Text style={styles.title}>樓層</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setFloor}
              placeholder={'(e.g., B3)'}
              placeholderTextColor={'#C5C5C5'}
            />
        </View>
        <Separator />
        <View style={styles.item}>  
          <Text style={styles.title}>確切位置</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setPosition}
              placeholder={'(e.g., 北側電梯井前)'}
              placeholderTextColor={'#C5C5C5'}
              
            />
        </View>
        <Button
          title="完成"
          onPress={async (req, res) => {
            if (!floor) {
              Alert.alert('請點選樓層');
              return;
            } else if (!position) {
              Alert.alert('請填寫確切位置');
              return;
            } else {
                  const data = {
                    locationName: `${floor}_${position}`,
                    floor: floor,
                    position: position,
                    projectId: route.params.projectId
                  };
                  axios({
                    method: 'post',
                    url: `${BASE_URL}/locations/add`,
                    data: data,
                  })
                    .then(async (res) => {
                      console.log('新增成功')
                      console.log(res.data);
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                  navigation.goBack();
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom:40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    alignSelf: 'center',
    height: 44,
    fontStyle: 'normal',
    fontSize: 36,
    lineHeight: 44,
    marginVertical:15,
    color: '#000000',
  },
  item: {
    padding:15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  textInput: {
    fontSize: 18,
    color: 'gray',
    width: 180,
    textAlign: 'right',
  },
  wrapper: {
    width: '80%',
    backgroundColor: 'white',
    
  },

});

export default IssueLocationAddScreen;
