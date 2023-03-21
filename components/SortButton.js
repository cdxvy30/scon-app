/* eslint-disable prettier/prettier */
import React, {useState, useContext, useRef} from 'react';
import {
  Animated,
  Easing,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';

const SortButton = ({
    selectedEndDate, 
    filteredIssueList, 
    setFilterIssueList, 
    issueList,
    setIssueList,
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

    // popUp功能選單中的排序選項
    const sort_option = [
        {
            title: '依時間(從新到舊)',
            icon: 'ios-arrow-up-sharp',
            icon_type:'ionicon',
            action: () => {
                selectedEndDate
                ? filteredIssueList.sort(
                    (a, b) => new Date(b.create_at) - new Date(a.create_at),
                )
                : issueList.sort(
                    (a, b) => new Date(b.create_at) - new Date(a.create_at),
                );
                selectedEndDate
                ? setFilterIssueList([...filteredIssueList])
                : setIssueList([...issueList]);
            },    
        },
        {
            title: '依時間(從舊到新)',
            icon: 'ios-arrow-down-outline',
            icon_type:'ionicon',
            action: () => {
                selectedEndDate
                ? filteredIssueList.sort(
                    (a, b) => new Date(a.create_at) - new Date(b.create_at),
                    )
                : issueList.sort(
                    (a, b) => new Date(a.create_at) - new Date(b.create_at),
                    );
                selectedEndDate
                ? setFilterIssueList([...filteredIssueList])
                : setIssueList([...issueList]);
            },
        },
    ]

    return (
        <React.Fragment>
            <TouchableOpacity>
                <Icon
                name="ios-swap-vertical-sharp"
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
                        <Text style={styles.popUpTitle}>排序</Text>
                        {sort_option.map((op, i) => (
                        <TouchableOpacity
                            style={[
                            styles.popUpMenu_option, 
                            {borderBottomWidth: i === sort_option.length - 1 ? 0 : 1},
                            ]} 
                            key={i} 
                            onPress={op.action}
                        >
                            <Text style={{fontSize:18}}>{op.title}</Text>
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
        top: 88,
        right: 100,
        shadowColor: '#666',
        shadowOffset: {width:-5, height:10},
        shadowOpacity: 0.7
    },
    popUpTitle: {
        fontWeight:'600',
        fontSize:20,
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

export default SortButton;
