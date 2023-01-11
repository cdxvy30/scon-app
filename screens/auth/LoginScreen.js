import React, {useContext, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {AuthContext} from '../../context/AuthContext';
import {Input, Icon, Button} from 'react-native-elements';
import ToastManager, {Toast} from 'toastify-react-native';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const {isLoading, login} = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Spinner visible={isLoading} />
      <View style={styles.wrapper}>
        <Text style={styles.caption_top}>
          營建工地智慧視覺監視與自動報告系統
        </Text>
        <Input
          placeholder="請輸入信箱"
          onChangeText={text => setEmail(text)}
          value={email}
          leftIcon={<Icon name="envelope" type="font-awesome" size={24} />}
        />
        <Input
          placeholder="請輸入密碼"
          onChangeText={text => setPassword(text)}
          value={password}
          leftIcon={<Icon name="key" type="font-awesome" size={24} />}
          secureTextEntry
        />
        <Button
          title="登入"
          onPress={() => {
            login(email, password);
          }}
        />
        <View style={{flexDirection: 'row', marginTop: 20}}>
          <Text>還沒有帳號嗎？ </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Register');
            }}>
            <Text style={styles.link}>註冊一個</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.caption_bottom}>
          Powerd By 臺大土木工程資訊模擬與管理研究中心
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    width: '80%',
  },
  link: {
    color: 'blue',
  },
  caption_top: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 30,
    fontWeight: 'bold',
  },
  caption_bottom: {
    textAlign: 'center',
    justifyContent: 'center',
  },
});

export default LoginScreen;
