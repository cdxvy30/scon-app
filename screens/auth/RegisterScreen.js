import React, {useContext, useState} from 'react';
import {
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {AuthContext} from '../../context/AuthContext';

const RegisterScreen = ({navigation}) => {
  const [name, setName] = useState(null);
  const [corporation, setCorporation] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  // const [permission, setPermission] = useState(null);

  const [selected, setSelected] = useState(null); // 以selected取代使用者身份

  const {isLoading, register} = useContext(AuthContext);

  const permissionList = [
    {key: '0', value: '管理員'},
    {key: '1', value: '專案管理員'},
    {key: '2', value: '專案使用者'},
    {key: '3', value: '訪客'},
  ];

  return (
    <View style={styles.container}>
      <Spinner visible={isLoading} />
      <View style={styles.wrapper}>
        <Text style={styles.caption_top}>
          營建工地智慧視覺監視與自動報告系統
        </Text>
        <TextInput
          style={styles.input}
          value={name}
          placeholder="輸入您的名字"
          onChangeText={text => setName(text)}
        />
        <TextInput
          style={styles.input}
          value={corporation}
          placeholder="輸入公司名稱"
          onChangeText={text => setCorporation(text)}
        />
        <TextInput
          style={styles.input}
          value={email}
          placeholder="輸入信箱"
          onChangeText={text => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          value={password}
          placeholder="設定密碼"
          onChangeText={text => setPassword(text)}
          secureTextEntry
        />
        <SelectList
          boxStyles={styles.input}
          data={permissionList}
          placeholder="請選擇您的身份"
          defaultOption={'3'}
          setSelected={setSelected}
          save="value"
        />
        <Button
          title="註冊"
          style={styles.input}
          onPress={() => {
            register(name, corporation, email, password, selected);
            console.log(selected);
          }}
        />

        <View style={{flexDirection: 'row', marginTop: 20}}>
          <Text>已經有帳號了嗎？ </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>登入</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.caption_bottom}>
        Powerd By 臺大土木工程資訊模擬與管理研究中心
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    width: '80%',
  },
  input: {
    marginTop: 16,
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
    alignItems: 'flex-end',
  },
});

export default RegisterScreen;
