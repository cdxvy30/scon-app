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
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import {
  transformExportIssues,
} from '../util/sqliteHelper';
import {Document, Packer} from 'docx';
import {
  issueReportGenerator,
  improveReportGenerator,
  issueHtmlGenerator,
} from '../screens/project/OutputTable';

const PopUpMenu = ({
    project,
    selectedStartDate, 
    setSelectedStartDate,
    selectedEndDate, 
    setSelectedEndDate,
    selectedIssueList, 
    setSelectedIssueList, 
    issueList,
    setIssueList,
    setIsExporting,
    navigation
}) => {
    const [popUpMenuVisible, setPopUpMenuVisible] = useState(false)
    const popUpMenuScale = useRef(new Animated.Value(0)).current

    const dirs = RNFetchBlob.fs.dirs;
    const docPath = dirs.DocumentDir;
    const projectName = project.project_name;
    const { config, fs } = RNFetchBlob;
    const { userInfo } = useContext(AuthContext);
    
    console.log('in pop up menu')
    console.log('issueList',issueList)
    console.log('selectissueList', selectedIssueList)

    // popUp功能選單的動畫及顯示控制 
    function resizePopUpMenu(to){
        to === 1 && setPopUpMenuVisible(true);
        Animated.timing(popUpMenuScale,{
        toValue:to,
        useNativeDriver:false, 
        duration:300,
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
                ? selectedIssueList.sort(
                    (a, b) => new Date(b.create_at) - new Date(a.create_at),
                )
                : issueList.sort(
                    (a, b) => new Date(b.create_at) - new Date(a.create_at),
                );
                selectedEndDate
                ? setSelectedIssueList([...selectedIssueList])
                : setIssueList([...issueList]);
            },    
        },
        {
            title: '依時間(從舊到新)',
            icon: 'ios-arrow-down-outline',
            icon_type:'ionicon',
            action: () => {
                selectedEndDate
                ? selectedIssueList.sort(
                    (a, b) => new Date(a.create_at) - new Date(b.create_at),
                    )
                : issueList.sort(
                    (a, b) => new Date(a.create_at) - new Date(b.create_at),
                    );
                selectedEndDate
                ? setSelectedIssueList([...selectedIssueList])
                : setIssueList([...issueList]);
            },
        },
    ]

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

    // popUp功能選單中的匯出選項
    const export_option = [
        {
            title: '匯出專案資訊',
            icon: 'information-outline',
            icon_type:'material-community',
            action: async() => {
                await fs.writeFile(
                `${docPath}/${projectName}-data.json`,
                JSON.stringify(
                    transformExportIssues(
                    selectedEndDate ? selectedIssueList : issueList,
                    ),
                ),
                'utf8',
                );

                const shareDataOption = {
                title: 'MyApp',
                message: `${projectName}-data`,
                url: `file://${docPath}/${projectName}-data.json`,
                type: 'application/json',
                subject: `${projectName}-data`, // for email
                };

                await Share.open(shareDataOption); // ...after the file is saved, send it to a system share intent
            },
        },
        {
            title: '匯出專案圖片',
            icon: 'image-multiple-outline',
            icon_type:'material-community',
            action: async() => {
                let urls = (selectedEndDate ? selectedIssueList : issueList).map(
                issue => 'file://' + issue.image.uri,
                );
                (selectedEndDate ? selectedIssueList : issueList).map(issue =>
                issue.attachments.map(
                    att => (urls = urls.concat('file://' + att.image)),
                ),
                );

                const shareImageOption = {
                title: 'MyApp',
                message: `${project.project_name}-image`,
                urls,
                subject: `${project.project_name}-image`, // for email
                };
                await Share.open(shareImageOption);
            },
        },
        {
            title: '匯出缺失記錄表(WORD)',
            icon: 'file-word-outline',
            icon_type:'material-community',
            action: async() => {
                console.log('Exporting all issue document')
                try{
                setIsExporting(true);
                const doc = new Document({
                    sections: await issueReportGenerator(
                    userInfo,
                    project,
                    selectedEndDate,
                    selectedStartDate,
                    selectedEndDate ? selectedIssueList : issueList,
                    fs
                    ),
                });

                await Packer.toBase64String(doc).then(base64 => {
                    fs.writeFile(
                    `${docPath}/${project.project_name}-缺失記錄表.docx`,
                    base64,
                    'base64',
                    );
                });

                const shareDataTableOption = {
                    title: 'MyApp',
                    message: `${project.project_name}-缺失記錄表`,
                    url: `file://${docPath}/${project.project_name}-缺失記錄表.docx`,
                    type: 'application/docx',
                    subject: `${project.project_name}-缺失記錄表`, // for email
                };

                await Share.open(shareDataTableOption); // ...after the file is saved, send it to a system share intent

                Alert.alert('匯出成功！', '', [
                    {
                    text: '返回',
                    onPress: () => setIsExporting(false),
                    style: 'cancel',
                    },
                ]);
                }
                catch(error){
                Alert.alert('匯出取消或失敗', '', [
                    {
                    text: '返回',
                    onPress: () => setIsExporting(false),
                    style: 'cancel',
                    },
                ]);
                }
                finally{
                RNFetchBlob.session('output_image').dispose();
                console.log('output image deleted')
                }
            },
        },
        {
            title: '匯出缺失改善前後記錄表(WORD)',
            icon: 'file-word-outline',
            icon_type:'material-community',
            action: async() => {
                try{
                setIsExporting(true);
                console.log('Exporting issue improvement document')

                const doc_2 = new Document({
                    sections: [
                    {
                        properties: {},
                        children: await improveReportGenerator(
                        userInfo,
                        selectedEndDate ? selectedIssueList : issueList,
                        fs,
                        config,
                        project,
                        ),
                    },
                    ],
                });

                await Packer.toBase64String(doc_2).then(base64 => {
                    fs.writeFile(
                    `${docPath}/${project.project_name}-缺失改善前後記錄表.docx`,
                    base64,
                    'base64',
                    );
                });

                const shareDataTableOption_2 = {
                    title: 'MyApp',
                    message: `${project.project_name}-缺失改善前後記錄表`,
                    url: `file://${docPath}/${project.project_name}-缺失改善前後記錄表.docx`,
                    type: 'application/docx',
                    subject: `${project.project_name}-缺失改善前後記錄表`, // for email
                };

                await Share.open(shareDataTableOption_2); // ...after the file is saved, send it to a system share intent
                Alert.alert('匯出成功！', '', [
                    {
                    text: '返回',
                    onPress: () => setIsExporting(false),
                    style: 'cancel',
                    },
                ]);
                }
                catch(error){
                console.log(`Issue improved document error: ${error}`)
                Alert.alert('匯出取消或失敗', '', [
                    {
                    text: '返回',
                    onPress: () => setIsExporting(false),
                    style: 'cancel',
                    },
                ]);
                }
                finally{
                RNFetchBlob.session('output_image').dispose();
                console.log('output image deleted')
                RNFetchBlob.session('improved_image').dispose();
                console.log('improved image deleted')
                }
            },
        },
        {
            title: '匯出缺失改善前後記錄表(HTML)',
            icon: 'file-link-outline',
            icon_type:'material-community',
            action: async() => {
                // const issue_web = issueHtmlGenerator(
                //   selectedEndDate ? selectedIssueList : issueList,
                //   fs,
                //   config,
                //   project,
                // );
                // await fs.writeFile(
                //   `${docPath}/${project.project_name}-缺失改善前後錄表.html`,
                //   issue_web.html,
                //   'utf8',
                // );
                // const shareDataOption_3 = {
                //   title: 'MyApp',
                //   message: `${project.project_name}-缺失改善前後錄表`,
                //   url: `file://${docPath}/${project.project_name}-缺失改善前後錄表.html`,
                //   type: 'application/html',
                //   subject: `${project.project_name}-缺失改善前後錄表`, // for email
                // };

                // await Share.open(shareDataOption_3); // ...after the file is saved, send it to a system share intent
            },
        },
    ]

    return (
        <React.Fragment>
            <TouchableOpacity>
                <Icon
                name="ios-ellipsis-horizontal-outline"
                type="ionicon"
                color="dodgerblue"
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
                    <View>
                        <Text style={styles.popUpTitle}>篩選</Text>
                        {filter_option.map((op, i) => (
                        <TouchableOpacity
                            style={[styles.popUpMenu_option, {borderBottomWidth: i === filter_option.length - 1 ? 0 : 1}]} 
                            key={i} 
                            onPress={op.action}
                        >
                            <Text style={{fontSize:18}}>{op.title}</Text>
                            <Icon name={op.icon} type={op.icon_type} size={26} color={'#212121'} style={{marginLeft: 40}} />
                        </TouchableOpacity>
                        ))}
                    </View>
                    <View>
                        <Text style={styles.popUpTitle}>匯出</Text>
                        {export_option.map((op, i) => (
                        <TouchableOpacity
                            style={[styles.popUpMenu_option, {borderBottomWidth: i === export_option.length - 1 ? 0 : 1}]} 
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
        right: 20,
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

export default PopUpMenu;
