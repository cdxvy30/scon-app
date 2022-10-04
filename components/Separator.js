import React from 'react';
import {StyleSheet, View} from 'react-native';

const Separator = ({marginVertical}) => {
  return (
    <React.Fragment>
      <View style={{marginVertical: marginVertical, ...styles.separator}} />
    </React.Fragment>
  );
};
const styles = StyleSheet.create({
  separator: {
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default Separator;
