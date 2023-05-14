/* eslint-disable prettier/prettier */
import React, {useState, useContext, useRef} from 'react';
import {AuthContext} from '../context/AuthContext';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';

const FilterButton = ({
    setSelectedStartDate,
    setSelectedEndDate,
    navigation
}) => {
    const [popUpMenuVisible, setPopUpMenuVisible] = useState(false)
    const popUpMenuScale = useRef(new Animated.Value(0)).current

    // popUp功能選單的動畫及顯示控制 
    function resizePopUpMenu(to){
        to === 1 && setPopUpMenuVisible(true);
        Animated.timing(popUpMenuScale,{
        toValue:to,
        useNativeDriver:false, 
        duration:200,
        easing:Easing.linear,
        }).start(() => to === 0 && setPopUpMenuVisible(false));
    }

    // popUp功能選單中的篩選選項
    const filter_option = [
        {
            title: '按日期篩選',
            icon: 'ios-calendar-outline',
            icon_type:'ionicon',
            action: () => {
                navigation.navigate('DateSelector', {
                setSelectedStartDate,
                setSelectedEndDate,
                });
            },
        },
        {
            title: '恢復全部顯示',
            icon: 'ios-refresh-outline',
            icon_type:'ionicon',
            action: () => {
                setSelectedStartDate(null);
                setSelectedEndDate(null);
            },
        },
    ]

    return (
        <React.Fragment>
            <TouchableOpacity>
                <Icon
                name="ios-filter-outline"
                type="ionicon"
                color="dodgerblue"
                style={{paddingHorizontal:5}}
                size={25}
                onPress={() => resizePopUpMenu(1)}
                />
            </TouchableOpacity>
            <Modal transparent visible={popUpMenuVisible}>
                <SafeAreaView style={{flex:1}} onTouchEnd={() => {resizePopUpMenu(0)}}>
                    <Animated.View style={[
                    styles.popUpMenu,
                    { opacity: popUpMenuScale.interpolate({ inputRange: [0, 1], outputRange: [0, 1]}) },
                    { transform: [{scale: popUpMenuScale}] },
                    ]}>
                    <View>
                        <Text style={styles.popUpTitle}>篩選</Text>
                        {filter_option.map((op, i) => (
                        <TouchableOpacity
                            style={[styles.popUpMenu_option, {borderBottomWidth: i === filter_option.length - 1 ? 0 : 1}]} 
                            key={i} 
                            onPress={op.action}
                        >
                            <Text style={{fontSize:16}}>{op.title}</Text>
                            <Icon name={op.icon} type={op.icon_type} size={26} color={'#212121'} style={{marginLeft: 40}} />
                        </TouchableOpacity>
                        ))}
                    </View>
                    </Animated.View>
                </SafeAreaView>
            </Modal>
        </React.Fragment>
    );
};

const styles = StyleSheet.create({
    popUpMenu: {
        backgroundColor: '#ddd',
        position: 'absolute',
        top: StatusBar.currentHeight ? StatusBar.currentHeight*2 : 88,
        right: 60,
        shadowColor: '#666',
        shadowOffset: {width:-5, height:10},
        shadowOpacity: 0.7
    },
    popUpTitle: {
        fontWeight:'600',
        fontSize:18,
        paddingHorizontal:8,
        paddingVertical:10,
    },
    popUpMenu_option:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal:15,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff'
    }
});

export default FilterButton;
