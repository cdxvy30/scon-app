import React, {useEffect, useState, useRef} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {
  Alert,
  Dimensions,
  Keyboard,
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

const windowSize = Dimensions.get('window')

const IssueLocationAddScreen = ({navigation, route}) => {
  const [floor, setFloor] = useState('');
  const [position, setPosition] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);                      // not sure what's this
  const keyboardDidShowListener = useRef();                                     // not sure what's this
  const keyboardDidHideListener = useRef();  

  const onKeyboardShow = event =>
  setKeyboardOffset(event.endCoordinates.height);
  const onKeyboardHide = () => setKeyboardOffset(0);

  useEffect(() => {
    keyboardDidShowListener.current = Keyboard.addListener(
      'keyboardWillShow',
      onKeyboardShow,
    );
    keyboardDidHideListener.current = Keyboard.addListener(
      'keyboardWillHide',
      onKeyboardHide,
    );

    return () => {
      keyboardDidShowListener.current.remove();
      keyboardDidHideListener.current.remove();
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, {marginBottom: keyboardOffset}]}>
      <Text style={styles.name}>請輸入以下資訊</Text>
      <View style={styles.wrapper}>
        <View style={styles.item}>
          <Text style={styles.title}>樓層</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setFloor}
              placeholder={'(e.g., B3)'}
              placeholderTextColor={'#C5C5C5'}
              onSubmitEditing={Keyboard.dismiss}
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
              onSubmitEditing={Keyboard.dismiss}
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
                      console.log('新增地點成功');
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    alignSelf: 'center',
    height: windowSize.width*0.12,
    fontStyle: 'normal',
    fontSize: windowSize.width*0.1,
    lineHeight: windowSize.width*0.12,
    marginVertical:windowSize.width*0.02,
    color: '#000000',
  },
  item: {
    flex: 1,
    paddingHorizontal: windowSize.width*0.05,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    fontSize: windowSize.width*0.045,
  },
  textInput: {
    fontSize: windowSize.width*0.045,
    color: 'gray',
    width: '70%',
    textAlign: 'right',
  },
  wrapper: {
    width: '80%',
    height: windowSize.width*0.4,
    backgroundColor: 'white',
  },

});

export default IssueLocationAddScreen;
