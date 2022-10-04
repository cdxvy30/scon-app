import React from 'react';
// import type {Node} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProjectListScreen from '../screens/project/ProjectListScreen';
import ProjectAddScreen from '../screens/project/ProjectAddScreen';
import IssueListScreen from '../screens/project/IssueListScreen';
import IssueScreen from '../screens/project/IssueScreen';
import PhotoScreen from '../screens/project/PhotoScreen';
import ObjectTypeSelectorScreen from '../screens/project/selector/ObjectTypeSelectorScreen';
import IssueTypeSelectorScreen from '../screens/project/selector/IssueTypeSelectorScreen';
import WorkItemListScreen from '../screens/project/WorkItemListScreen';
import WorkItemAddScreen from '../screens/project/WorkItemAddScreen'


const Stack = createNativeStackNavigator();

const ProjectNavigation = ({navigation}) => {
  return (
    <React.Fragment>
      <Stack.Navigator>
        <Stack.Screen
          name="ProjectList"
          component={ProjectListScreen}
          options={{title: '專案列表'}}
        />
        <Stack.Screen
          name="IssueList"
          component={IssueListScreen}
          options={({route}) => ({title: route.params.name})}
        />
        <Stack.Screen
          name="Issue"
          component={IssueScreen}
          options={{title: ''}}
        />
        <Stack.Group screenOptions={{presentation: 'modal'}}>
          <Stack.Screen
            name="ProjectAdd"
            component={ProjectAddScreen}
            options={{title: '新增專案'}}
          />
        </Stack.Group>
        <Stack.Screen
          name="Photo"
          component={PhotoScreen}
          options={{title: '照片標註'}}
        />
        <Stack.Screen
          name="ObjectTypeSelector"
          component={ObjectTypeSelectorScreen}
          options={{title: '物件類別'}}
        />
        <Stack.Screen
          name="IssueTypeSelector"
          component={IssueTypeSelectorScreen}
          options={{title: '缺失項目'}}
        />
        <Stack.Screen
          name="WorkItemList"
          component={WorkItemListScreen}
          options={{title: '工項列表'}}
        />
        <Stack.Screen
          name="WorkItemAdd"
          component={WorkItemAddScreen}
          options={{title: '工項資訊'}}
        />

      </Stack.Navigator>
    </React.Fragment>
  );
};

export default ProjectNavigation;
