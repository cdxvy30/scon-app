import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SettingScreen from '../screens/setting/SettingScreen';
import DataManagementScreenList from '../screens/setting/DataManagementListScreen';
import DataManagementScreen from '../screens/setting/DataManagementScreen';
import CorporationListScreen from '../screens/setting/CorporationListScreen';
import CorporationAddScreen from '../screens/setting/CorporationAddScreen';
import UserListScreen from '../screens/user/UserListScreen';
import UserManagementScreen from '../screens/user/UserManagementScreen';

const Stack = createNativeStackNavigator();

const SettingNavigation = ({}) => {
  return (
    <React.Fragment>
      <Stack.Navigator>
        <Stack.Screen
          name="Setting"
          component={SettingScreen}
          options={{title: '設定'}}
        />
        <Stack.Screen
          name="DataManageList"
          component={DataManagementScreenList}
          options={{title: '資料管理'}}
        />
        <Stack.Screen
          name="DataManage"
          component={DataManagementScreen}
          options={{title: '專案'}}
        />
        <Stack.Screen
          name="CorporationList"
          component={CorporationListScreen}
          options={{title: '責任廠商'}}
        />
        <Stack.Screen
          name="CorporationAdd"
          component={CorporationAddScreen}
          options={{title: '廠商資訊'}}
        />
        <Stack.Screen
          name="UserListScreen"
          component={UserListScreen}
          options={{title: '使用者清單'}}
        />
        <Stack.Screen
          name="UserManagementScreen"
          component={UserManagementScreen}
          options={{title: '使用者管理'}}
        />
      </Stack.Navigator>
    </React.Fragment>
  );
};

export default SettingNavigation;
