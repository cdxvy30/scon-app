import React, {createContext, useContext} from "react";
import { connect } from "react-redux";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const userInfo = AsyncStorage.getItem("userInfo");

export const APNContext = createContext({
  configure: () => {
    PushNotification.configure({
      onRegister: function (tokenData) {
        console.log('onRegisterDevice');
        const { token } = tokenData;
        console.log(token);
        let user = userInfo._z;
        let userJson = JSON.parse(user);
        console.log(userJson.user.uuid);

        // Send "device token" to server-side
        axios({
          method: 'post',
          body: {
            deviceToken: token,
            userId: userJson.user.uuid,
          },
        })
          .then(() => {})
          .catch((e) => {console.error(e);})

      },
      onNotification: function (notification) {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  },
});

export const APNProvider = ({children}) => {
  // Do not work here.
  // Not familliar with Context.
  const configure = () => {
    PushNotification.configure({
      onRegister: function (tokenData) {
        console.log('onRegister');
        const { token } = tokenData;
        console.log(token);
      },
      onNotification: function (notification) {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  return (
    <APNContext.Provider
      value={{
        configure: configure,
      }}
    >
      {children}
    </APNContext.Provider>
  );
};
