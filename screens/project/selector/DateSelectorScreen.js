import React, {useState} from 'react';
import {
    Button,
    StyleSheet,
    Text,
    View
  } from 'react-native';
  import CalendarPicker from 'react-native-calendar-picker';

const DateSelectorScreen = ({navigation, route}) => {
    const [ selectedStartDate_1, setSelectedStartDate_1] = useState(null);
    const [ selectedEndDate_1, setSelectedEndDate_1] = useState(null);
    const minDate = new Date(2018, 1, 1); // Today
    const startDate  =  selectedStartDate_1 ? selectedStartDate_1.toString() : '';
    const endDate = selectedEndDate_1 ? selectedEndDate_1.toString() : '';

    const onDateChange = (date, type) => {
        if (type === 'END_DATE') {
          route.params.setSelectedEndDate(date);
          setSelectedEndDate_1(date);
        } else {
            route.params.setSelectedStartDate(date);
            route.params.setSelectedEndDate(null);
            setSelectedStartDate_1(date);
          };
        }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Button title="完成" onPress={() => {navigation.goBack();}} />,
            headerLeft: () => <Button title="取消" onPress={() => {navigation.goBack();}} />
        });
        }, [navigation]);

    return (
        <View style={styles.dateselector}>
            <CalendarPicker
            startFromMonday={true}
            allowRangeSelection={true}
            showDayStragglers={true}
            minDate={minDate}
            previousTitle="上一月"
            nextTitle='下一月'
            todayBackgroundColor="#f2e6ff"
            selectedDayColor="#7300e6"
            selectedDayTextColor="#FFFFFF"
            onDateChange={onDateChange}
            />

            <View>
                <Text>起始日期:{ startDate }</Text>
                <Text>結束日期:{ endDate }</Text>
            </View>
        </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      marginTop: 100,
    },
  });


export default DateSelectorScreen;