import React, { useState } from 'react';
import {
  SafeAreaView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'react-native-blur';
import { ISSUE_TYPE } from '../../../configs/issueTypeConfig';

const initItemData = selectedName => {
  const data = [];
  ISSUE_TYPE.map(typeObject => {
    const groupItem = { title: typeObject.title, data: [] };
    typeObject.type.map(t => {
      groupItem.data.push({
        name: t,
        isSelected: t === selectedName,
      });
    });
    data.push(groupItem);
  });
  return data;
};

const refreshItemDataSelected = (itemData, sectionTitle, index) => {
  const data = itemData;
  //clear selection
  data.map((d, i) => {
    d.data.map((s, j) => {
      s.isSelected = false;
    });
  });

  //setSelection
  data.map(d => {
    if (d.title === sectionTitle) {
      if (d.data[index] !== undefined) {
        d.data[index].isSelected = !d.data[index].isSelected;
      }
    }
  });
  return data;
};

const IssueTypeSelectorScreen = ({ navigation, route }) => {
  const [itemData, setItemData] = useState(initItemData(route.params.name));

  const issueTypeSelectHandler = (item, section, index) => {
    setItemData(refreshItemDataSelected(itemData, section.title, index));
    route.params.setIssueType(item.name);
    navigation.goBack();
  };

  const Item = ({ data }) => {
    let item = data.item;
    let section = data.section;
    let index = data.index;

    return (
      <React.Fragment>
        <TouchableOpacity
          onPress={() => issueTypeSelectHandler(item, section, index)}>
          <View id={section.title + index} style={styles.item}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.title}>{item.name}</Text>
              {item.isSelected ? (
                <Ionicons
                  style={{ fontSize: 20, color: 'goldenrod' }}
                  name={'ios-checkmark'}
                />
              ) : undefined}
            </View>
          </View>
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <SafeAreaView style={styles.container}>
        <SectionList
          sections={itemData}
          keyExtractor={(item, index) => item + index}
          renderItem={data => <Item data={data} />}
          renderSectionHeader={({ section: { title } }) => (
            <BlurView
              blurType="light"
              blurAmount={20}>
              <Text style={styles.header}>{title}</Text>
            </BlurView>
          )}
        />
      </SafeAreaView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 5,
    borderRadius: 12,
  },
  header: {
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,

  },
  title: {
    fontSize: 18,
  },
});

export default IssueTypeSelectorScreen;
