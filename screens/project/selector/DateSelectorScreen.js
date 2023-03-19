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
    const startDate  =  selectedStartDate_1 ? new Date(selectedStartDate_1).toLocaleDateString() : '';
    const endDate = selectedEndDate_1 ? new Date(selectedEndDate_1).toLocaleDateString() : '';
    
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
            headerLeft: () => <Button title="取消" onPress={() => {
              navigation.goBack();
              route.params.setSelectedStartDate(null);
              route.params.setSelectedEndDate(null);
            }} />
        });
        }, [navigation]);

    return (
        <View style={styles.dateselector}>
            <CalendarPicker
            weekdays={['日','一','二','三','四','五','六']}
            months={['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']}
            allowRangeSelection={true}
            allowBackwardRangeSelect={true}
            showDayStragglers={true}
            minDate={new Date(2018, 1, 1)}
            maxDate={new Date()}
            previousTitle="上一月"
            nextTitle='下一月'
            restrictMonthNavigation={true} //Whether to disable Previous month button if it is before minDate or Next month button if it is after MaxDate.
            selectMonthTitle="選擇月份    "
            selectYearTitle="選擇年份"
            todayBackgroundColor="#ACD6FD"
            selectedDayColor="#0083FC"
            selectedDayTextColor="#FFFFFF"
            onDateChange={onDateChange}
            />

            <View>
                <Text style={styles.text}>起始日期:   { startDate }</Text>
                <Text style={styles.text}>結束日期:   { endDate }</Text>
            </View>
        </View>
  );
};

const styles = StyleSheet.create({
    dateselector:{
      padding:10,
      marginTop:15,
    },
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      marginTop: 100,
    },
    text:{
      marginTop: 15,
      marginLeft: 10,
      fontSize: 17
    }
  });


export default DateSelectorScreen;