import React, {useContext, useState} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {Input, Icon, Button} from 'react-native-elements';
import {SelectList} from 'react-native-dropdown-select-list';
import {AuthContext} from '../../context/AuthContext';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';

const RegisterScreen = ({navigation}) => {
  const [name, setName] = useState(null);
  const [corporation, setCorporation] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const {isLoading, register} = useContext(AuthContext);

  const corporationList = [
    {label: '世曦工程顧問股份有限公司', value: '世曦工程顧問股份有限公司'},
    {label: '豐譽營造股份有限公司', value: '豐譽營造股份有限公司'},
    {label: '瑞助營造股份有限公司', value: '瑞助營造股份有限公司'},
    {label: '建國工程股份有限公司', value: '建國工程股份有限公司'},
  ];

  return (
    <View style={styles.container}>
      <Spinner visible={isLoading} />
      <View style={styles.wrapper}>
        <Text style={styles.caption_top}>
          營建工地智慧視覺監視與自動報告系統
        </Text>
        <Dropdown
          style={styles.dropdown}
          data={corporationList}
          placeholder="請選擇您的公司"
          labelField="label"
          valueField="value"
          value={corporation}
          onChange={item => {
            setCorporation(item.value);
          }}
          renderLeftIcon={() => (
            <AntDesign style={styles.icon} name="Safety" size={24} />
          )}
        />
        <Input
          style={styles.input}
          value={name}
          placeholder="輸入您的名字"
          onChangeText={text => setName(text)}
          leftIcon={
            <Icon
              name="user"
              type="font-awesome"
              size={24}
              style={{marginTop: 20}}
            />
          }
        />
        <Input
          value={email}
          placeholder="輸入信箱"
          onChangeText={text => setEmail(text)}
          leftIcon={<Icon name="envelope" type="font-awesome" size={20} />}
        />
        <Input
          value={password}
          placeholder="設定密碼"
          onChangeText={text => setPassword(text)}
          leftIcon={<Icon name="key" type="font-awesome" size={20} />}
          secureTextEntry
        />
        <Button
          title="註冊"
          onPress={() => {
            register(name, corporation, email, password);
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
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  input: {
    marginTop: 30,
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
