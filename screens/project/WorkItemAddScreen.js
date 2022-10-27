import React, {useState} from 'react';

import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

// name: {type: types.TEXT, not_null: true},
// manager: {type: types.TEXT, not_null: true},
// phone_number: {type: types.TEXT, not_null: true},
// company: {type: types.TEXT, not_null: true},

const WorkItemAddScreen = ({navigation, route}) => {
  let workitem = route.params.item;
  const [name, setName] = useState(workitem? workitem.name:'');
  const [manager, setManager] = useState(workitem? workitem.manager:'');
  const [phone_number, setPhone_Number] = useState(workitem? workitem.phone_number:'');
  const [company, setCompany] = useState(workitem? workitem.company:'');
  const projectId = route.params.projectId; 

  const workitemAddHandler = React.useCallback(async () => {
    if (!name) {
      Alert.alert('請填入工項');
      return;
    }


    const newWorkItem = {
      name,
      manager,
      phone_number,
      company,
      project_id: projectId
    };
    await SqliteManager.createWorkItem(newWorkItem);
    navigation.goBack()
  }, [
    name,
    manager,
    phone_number,
    company,
    projectId
  ]);

  const workitemUpdateHandler = React.useCallback(async () => {
    if (!name) {
      Alert.alert('請填入工項');
      return;
    }

    const newWorkItem = {
      name,
      manager,
      phone_number,
      company,
      project_id: projectId,
      timestamp: new Date().toISOString()
    };

    await SqliteManager.updateWorkItem(workitem.id, newWorkItem);
    navigation.goBack();
  }, [
    name,
    manager,
    phone_number,
    company,
    projectId
  ]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="完成" onPress={workitem? workitemUpdateHandler : workitemAddHandler} />,
      headerLeft: () => <Button title="取消" onPress={() => {navigation.goBack();}} />
    });
  }, [workitemAddHandler, navigation]);

  return (
    <React.Fragment>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.inputAreaContainer}>
            <Text style={styles.title}>工項名稱</Text>
            <View style={styles.inputContainer}>
              <NewProjectTextInput
                multiline={false}
                numberOfLines={1}
                onChangeText={text => setName(text)}
                defaultValue={name}
                value={name}
                style={styles.input}
                
              />
            </View>
            <Text style={styles.title}>工項負責人</Text>
            <View style={styles.inputContainer}>
              <NewProjectTextInput
                multiline={false}
                numberOfLines={1}
                onChangeText={text => setManager(text)}
                defaultValue={manager}
                value={manager}
                style={styles.input}
              />
            </View>
            <Text style={styles.title}>手機號碼</Text>
            <View style={styles.inputContainer}>
              <NewProjectTextInput
                multiline={false}
                numberOfLines={1}
                onChangeText={text => setPhone_Number(text)}
                defaultValue={phone_number}
                value={phone_number}
                style={styles.input}
              />
            </View>
            <Text style={styles.title}>廠商名稱</Text>
            <View style={styles.inputContainer}>
              <NewProjectTextInput
                multiline={false}
                numberOfLines={1}
                onChangeText={text => setCompany(text)}
                defaultValue={company}
                value={company}
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

export default WorkItemAddScreen;