import React, {useContext, useState} from 'react';
import {
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {AuthContext} from '../../context/AuthContext';

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
        <TextInput
          style={styles.input}
          value={email}
          placeholder="輸入信箱"
          onChangeText={text => setEmail(text)}
        />

        <TextInput
          style={styles.input}
          value={password}
          placeholder="輸入密碼"
          onChangeText={text => setPassword(text)}
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
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
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
  input: {
    marginTop: 14,
    paddingVertical: 8,
    borderWidth: 4,
    borderColor: '#20232a',
    borderRadius: 6,
    backgroundColor: '#61dafb',
    color: '#20232a',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
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
