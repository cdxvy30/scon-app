import React, {useState, useContext} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import { AuthContext } from '../../context/AuthContext';

import {
  ActionSheetIOS,
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  // Dimensions,
  // Keyboard,
  // KeyboardAvoidingView,
  // SectionList,
  // StatusBar,
  // Switch,
  // TouchableWithoutFeedback,
  // useColorScheme,
} from 'react-native';
import SqliteManager from '../../services/SqliteManager';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PROJECT_STATUS } from './ProjectEnum';
import axios from 'axios';
import {BASE_URL} from '../../configs/authConfig';

const ProjectAddScreen = ({navigation, route}) => {
  const {userInfo} = useContext(AuthContext);
  // console.log(route);
  // console.log(route.params);
  // console.log(BASE_URL);
  let project = route.params.project;
  const [thumbnail, setThumbnail] = useState(project ? project.image : '');
  const [name, setName] = useState(project ? project.name : '');
  const [address, setAddress] = useState(project ? project.address : '');
  const [manager, setManager] = useState(project ? project.manager : '');
  const [company, setCompany] = useState(project ? project.company : '');
  const [inspector, setInspector] = useState(
    project ? project.inspector : userInfo.user.name,
  );
  const [email, setEmail] = useState(project ? project.email:userInfo.user.email);
  const [isLoading, setIsLoading] = useState(false);


  const projectAddHandler = React.useCallback(async () => {
    if (!name) {
      Alert.alert('請填入工地名稱');
      return;
    }

    const users = await SqliteManager.getAllUsers();
    const newProject = {
      name,
      address,
      company,
      manager,
      inspector,
      email,
      user_id: users[0].id,
      image:
        thumbnail.uri ??
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVZ5Jn3h_R2_PdWnYoXgOqjwFKT5C4JTODvCjfDwaleOsM6AxT8L1DBhRi4FeGP7ua7F8&usqp=CAU',
      status: PROJECT_STATUS.lowRisk.id,
    };
    // 將project內容存入地端資料庫
    const projectAddToPGSQL = () => {
      console.log(name);
      console.log('try to store in PGSQL.');
      setIsLoading(true);
      axios
        .post(`${BASE_URL}/projects`, {
          name,
          address,
          company,
          manager,
          inspector,
          email,
        })
        .then(async res => {
          let project_data = await res.data;
          console.log(project_data);
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`add new project error: ${e}`);
        });
    };
    projectAddToPGSQL();
    
    await SqliteManager.createProject(newProject);
    navigation.goBack();
  }, [
    name,
    address,
    company,
    manager,
    inspector,
    email,
    thumbnail,
    navigation,
  ]);

  const projectUpdateHandler = React.useCallback(async () => {
    if (!name) {
      Alert.alert('請填入工地名稱');
      return;
    }

    const users = await SqliteManager.getAllUsers();
    const newProject = {
      name,
      address,
      company,
      manager,
      inspector,
      email,
      user_id: users[0].id,
      image:
        thumbnail.uri ??
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVZ5Jn3h_R2_PdWnYoXgOqjwFKT5C4JTODvCjfDwaleOsM6AxT8L1DBhRi4FeGP7ua7F8&usqp=CAU',
    };
    await SqliteManager.updateProject(route.params.project.id, newProject);
    navigation.goBack();
  }, [
    name,
    address,
    company,
    manager,
    inspector,
    email,
    thumbnail,
    navigation,
  ]);

  const imageSelectHandler = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['選擇縮圖', '刪除縮圖', '取消'],
        destructiveButtonIndex: [1],
        cancelButtonIndex: 1,
        userInterfaceStyle: 'light', //'dark'
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            launchImageLibrary({mediaType: 'photo'}, res => {
              if (res.errorMessage !== undefined) {
                console.error(`code: ${res.errorCode}: ${res.errorMessage}`);
                return;
              }

              if (!res.didCancel) {
                const image = {
                  ...res.assets[0],
                  uri: res.assets[0].uri.replace('file://', ''),
                };
                setThumbnail(image);
              }
            });
            break;
          case 1:
            setThumbnail(undefined);
            break;
        }
      },
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="完成"
          onPress={project ? projectUpdateHandler : projectAddHandler}
        />
      ),
      headerLeft: () => (
        <Button
          title="取消"
          onPress={() => {
            navigation.goBack();
          }}
        />
      ),
    });
  }, [projectAddHandler, navigation]);

  return (
    <React.Fragment>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.imageAreaContainer}>
            <TouchableOpacity onPress={imageSelectHandler}>
              <View style={styles.imageContainer}>
                {thumbnail ? (
                  <Image style={styles.image} source={{uri: thumbnail.uri}} />
                ) : (
                  <Ionicons
                    style={{
                      fontSize: 130,
                      color: 'goldenrod',
                      paddingVertical: 40,
                      // backgroundColor: 'gray',
                    }}
                    name={'ios-image'}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.inputAreaContainer}>
            <Text style={styles.title}>工地名稱</Text>
            <View style={styles.inputContainer}>
              <NewProjectTextInput
                multiline={false}
                numberOfLines={1}
                onChangeText={text => setName(text)}
                value={name}
                style={styles.input}
              />
            </View>
            <Text style={styles.title}>地址</Text>
            <View style={styles.inputContainer}>
              <NewProjectTextInput
                multiline={false}
                numberOfLines={1}
                onChangeText={text => setAddress(text)}
                value={address}
                style={styles.input}
              />
            </View>
            <Text style={styles.title}>負責人</Text>
            <View style={styles.inputContainer}>
              <NewProjectTextInput
                multiline={false}
                numberOfLines={1}
                onChangeText={text => setManager(text)}
                value={manager}
                style={styles.input}
              />
            </View>
            <Text style={styles.title}>廠商名稱</Text>
            <View style={styles.inputContainer}>
              <NewProjectTextInput
                multiline={false}
                numberOfLines={1}
                onChangeText={text => setCompany(text)}
                value={company}
                style={styles.input}
              />
            </View>
            <Text style={styles.title}>記錄人員</Text>
            <View style={styles.inputContainer}>
              <NewProjectTextInput
                multiline={false}
                numberOfLines={1}
                onChangeText={text => setInspector(text)}
                value={inspector}
                style={styles.input}
              />
            </View>
            <Text style={styles.title}>電子郵件</Text>
            <View style={styles.inputContainer}>
              <NewProjectTextInput
                multiline={false}
                numberOfLines={1}
                onChangeText={text => setEmail(text)}
                value={email}
                style={styles.input}
              />
            </View>
          </View>
          <View style={{height: 300}} />
        </ScrollView>
      </SafeAreaView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageAreaContainer: {
    paddingVertical: 5,
  },
  imageContainer: {
    backgroundColor: 'lightgray',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 220,
  },
  inputAreaContainer: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  inputContainer: {
    borderBottomColor: 'darkgray',
    borderBottomWidth: 1,
  },
  input: {
    height: 30,
    fontSize: 20,
    marginTop: 3,
    // paddingBottom: 3,
    // paddingTop: 8,
    // padding: 10,
  },
  title: {
    color: 'gray',
    fontSize: 18,
    marginTop: 18,
  },
});

const NewProjectTextInput = props => {
  return (
    <TextInput
      {...props} // Inherit any props passed to it; e.g., multiline, numberOfLines below
      editable={true}
      maxLength={40}
    />
  );
};

export default ProjectAddScreen;
