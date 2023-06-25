import React, {createContext} from "react";
import { connect } from "react-redux";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";

export const APNContext = createContext({
  configure: () => {
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
