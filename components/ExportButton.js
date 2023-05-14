/* eslint-disable prettier/prettier */
import axios from "axios";
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

const ExportButton = ({
    base_url,
    project,
    selectedStartDate, 
    selectedEndDate, 
    filteredIssueList, 
    issueList,
    setIsExporting,
}) => {
    const [popUpMenuVisible, setPopUpMenuVisible] = useState(false)
    const popUpMenuScale = useRef(new Animated.Value(0)).current

    const dirs = RNFetchBlob.fs.dirs;
    const docPath = dirs.DocumentDir;
    const projectName = project.project_name;
    const { config, fs } = RNFetchBlob;
    const { userInfo } = useContext(AuthContext);

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

    // popUp功能選單中的匯出選項
    const export_option = [
        // {
        //     title: '匯出專案資訊',
        //     icon: 'information-outline',
        //     icon_type:'material-community',
        //     action: async() => {
        //         await fs.writeFile(
        //         `${docPath}/${projectName}-data.json`,
        //         JSON.stringify(
        //             transformExportIssues(
        //             selectedEndDate ? filteredIssueList : issueList,
        //             ),
        //         ),
        //         'utf8',
        //         );

        //         const shareDataOption = {
        //         title: 'MyApp',
        //         message: `${projectName}-data`,
        //         url: `file://${docPath}/${projectName}-data.json`,
        //         type: 'application/json',
        //         subject: `${projectName}-data`, // for email
        //         };

        //         await Share.open(shareDataOption); // ...after the file is saved, send it to a system share intent
        //     },
        // },
        // {
        //     title: '匯出專案圖片',
        //     icon: 'image-multiple-outline',
        //     icon_type:'material-community',
        //     action: async() => {
        //         let urls = (selectedEndDate ? filteredIssueList : issueList).map(
        //         issue => 'file://' + issue.image.uri,
        //         );
        //         (selectedEndDate ? filteredIssueList : issueList).map(issue =>
        //         issue.attachments.map(
        //             att => (urls = urls.concat('file://' + att.image)),
        //         ),
        //         );

        //         const shareImageOption = {
        //         title: 'MyApp',
        //         message: `${project.project_name}-image`,
        //         urls,
        //         subject: `${project.project_name}-image`, // for email
        //         };
        //         await Share.open(shareImageOption);
        //     },
        // },
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
                    selectedEndDate ? filteredIssueList : issueList,
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
                            selectedEndDate ? filteredIssueList : issueList,
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
            title: 'backend export test',
            icon: 'file-word-outline',
            icon_type:'material-community',
            action: async() => {
                await RNFetchBlob.config({             //先將圖片暫時載到本地端
                    fileCache: true,
                    path:dirs.DocumentDir + `/${project.project_name}.xlsx`
                })
                .fetch('GET', `${base_url}/sheet/${project.project_id}`)
                .then((res) => {
                    console.log(project)
                    console.log("The file saved to ", res.path())
                    if (Platform.OS === "ios") {
                        setTimeout(() => {
                            RNFetchBlob.fs.writeFile(res.path(), res.data, 'base64'); 
                            RNFetchBlob.ios.previewDocument(res.path()); 
                        },500);
                    }
                })
                .catch(err => {
                    console.log(err);
                });

                // await axios
                // .get(`${base_url}/sheet/${project.project_id}`)
                // .then(async (res) => {
                // let projects = await res.data;
                // console.log(projects);
                // // setProjectList(projects);
                // })
                // .catch((e) => {
                // console.error(`List Projects Error: ${e}`);
                // });
            },
        }
        // {
        //     title: '匯出缺失改善前後記錄表(HTML)',
        //     icon: 'file-link-outline',
        //     icon_type:'material-community',
        //     action: async() => {
        //         try{
        //             setIsExporting(true);
        //             const issue_web = await issueHtmlGenerator(
        //                 selectedEndDate ? filteredIssueList : issueList,
        //                 userInfo,
        //                 project,
        //               );
        //             fs.writeFile(
        //                 `${docPath}/${project.project_name}-缺失改善前後錄表.html`,
        //                 issue_web.html,
        //                 'utf8',
        //               );
        //             const shareDataOption_3 = {
        //                 title: 'MyApp',
        //                 message: `${project.project_name}-缺失改善前後錄表`,
        //                 url: `file://${docPath}/${project.project_name}-缺失改善前後錄表.html`,
        //                 type: 'application/html',
        //                 subject: `${project.project_name}-缺失改善前後錄表`, // for email
        //               };
      
        //             await Share.open(shareDataOption_3); // ...after the file is saved, send it to a system share intent

        //             Alert.alert('匯出成功！', '', [
        //                 {
        //                 text: '返回',
        //                 onPress: () => setIsExporting(false),
        //                 style: 'cancel',
        //                 },
        //             ]);
        //         }
        //         catch(error){
        //             console.log(`Issue improved document error: ${error}`)
        //             Alert.alert('匯出取消或失敗', '', [
        //             {
        //             text: '返回',
        //             onPress: () => setIsExporting(false),
        //             style: 'cancel',
        //             },
        //         ]);
        //         }
        //     },
        // },
    ]

    return (
        <React.Fragment>
            <TouchableOpacity>
                <Icon
                name="export-variant"
                type="material-community"
                color="dodgerblue"
                size={25}
                style={{paddingHorizontal:5}}
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
                        <Text style={styles.popUpTitle}>匯出</Text>
                        {export_option.map((op, i) => (
                        <TouchableOpacity
                            style={[styles.popUpMenu_option, {borderBottomWidth: i === export_option.length - 1 ? 0 : 1}]} 
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
        right: 30,
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

export default ExportButton;
