import React from "react";
import { Text, StyleSheet } from "react-native";

const UserInfoScreen = () => {
  return (
    <React.Fragment>
      <Text style={styles.header}>使用者資訊</Text>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 42,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});

export default UserInfoScreen;
