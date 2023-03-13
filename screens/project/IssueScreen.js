/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useContext,
} from 'react';
import {AuthContext} from '../../context/AuthContext';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Separator from '../../components/Separator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PhotoLabelViewer from './../../components/PhotoLabelViewer';
import Share from 'react-native-share';
import {
  Alert,
  ActionSheetIOS,
  Button,
  Dimensions,
  Image,
  Icon,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SqliteManager from '../../services/SqliteManager';
import {transformLabels} from '../../util/sqliteHelper';
import {useIsFocused} from '@react-navigation/native';
import {ISSUE_STATUS, getIssueStatusById} from './IssueEnum';
import {ISSUE_TYPE} from '../../configs/issueTypeConfig';
import {PROJECT_STATUS} from './ProjectEnum';
import {transformIssues} from '../../util/sqliteHelper';
import {WorkItemList} from './WorkItemListScreen';
import {ButtonGroup} from 'react-native-elements';
import {BASE_URL} from '../../configs/authConfig';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import RemoteImageWithSketch from './RemoteImageWithSketch';
import FastImage from 'react-native-fast-image';

const IssueScreen = ({navigation, route}) => {
  console.log('--- Pass to IssueScreen ---');
  const project = route.params.project;
  const item = route.params.item;
  console.log('item: ', item);
  const projectId = project.project_id;                                         // ID作為issue的FK, 同時綁專案名稱、公司
  const projectName = project.project_name;
  const projectCorporation = project.project_corporation;
  const windowSize = Dimensions.get('window');

  const {userInfo} = useContext(AuthContext);
  const [action, setAction] = useState(route.params.action);

  const [issueId, setIssueId] = useState(item.id);

  const [selectedIssueLocationId, setSelectedIssueLocationId] = useState(null);

  const [violationType, setViolationType] = useState(                           // 缺失類別
    route.params.violation_type
      ? route.params.violation_type
      : item.violation_type,
  );
  const [issueType, setIssueType] = useState(item.type);                        // 缺失項目
  // const [issueTypeRemark, setIssueTypeRemark] = useState(item.type_remark);     // if 類別=='其他' 這裡要填項目說明
  const [issueTrack, setIssueTrack] = useState(item.tracking);                  // 追蹤與否
  const [issueLocationText, setIssueLocationText] = useState(item.location);    // 缺失地點
  const [responsibleCorporation, setResponsibleCorporation] = useState(         // 責任廠商
    item.responsible_corporation,
  );
  const [responsibleCorpOptions, setResponsibleCorpOptions] = useState([]);
  const [issueTaskText, setIssueTaskText] = useState(item.activity);            // 缺失工項

  // v 用不到
  const [issueAssigneeText, setIssueAssigneeText] = useState(item.assignee);    // 紀錄人員(不需紀錄, 因為必定為App使用者)
  const [issueAssigneePhoneNumberText, setIssueAssigneePhoneNumberText] =       // 紀錄人員聯絡方式(不需紀錄, 從資料庫即可查到)
    useState(item.assignee_phone_number);
  const [issueSafetyManagerText, setIssueSafetyManagerText] = useState(         // 也是紀錄人員?
    userInfo.user.name,
  );

  // 原本的方法可能有問題, 因為在IssueListScreen navigate過來的function內, attachments必為空陣列
  const [issueAttachments, setIssueAttachments] = useState(item.attachments);   // 缺失改善照片
  const [issueLabels, setIssueLabels] = useState(transformLabels(item.labels)); // 缺失影像中的標註
  const [issueStatus, setIssueStatus] = useState(item.status);                  // 缺失風險高低
  const [keyboardOffset, setKeyboardOffset] = useState(0);                      // not sure what's this
  const keyboardDidShowListener = useRef();                                     // not sure what's this
  const keyboardDidHideListener = useRef();                                     // not sure what's this
  const isFocused = useIsFocused();

  // console.log('In begin: \n', issueAttachments);

  // 功用未知
  const onKeyboardShow = event =>
    setKeyboardOffset(event.endCoordinates.height);
  const onKeyboardHide = () => setKeyboardOffset(0);

  // 更改issue追蹤狀態(Boolean)
  const issueTrackToggleHandler = () => {
    setIssueTrack(previousState => !previousState);
  };

  // const WorkItemListHandler = async () => {
  //   navigation.navigate('WorkItemList', {
  //     project: route.params.project,
  //     projectId: route.params.projectId,
  //     setIssueTaskText,
  //     setIssueAssigneeText,
  //     setIssueAssigneePhoneNumberText: assignee_phone_number =>{setIssueAssigneePhoneNumberText(assignee_phone_number)}

  //   })};

  // 新增缺失改善照片
  const attachmentAddHandler = React.useCallback(async image => {
    const imageUri = image.uri;
    const imageName = image.fileName;
    const transformedImageUri = imageUri.replace('file://', '');

    // ************************************************************ //
    const data = {
      projectId: projectId,
      projectName: projectName,
      projectCorporation: projectCorporation,
    };  // 用於存檔
    const metadata = JSON.stringify(data);
    var bodyFormData = new FormData();
    bodyFormData.append('metadata', metadata);
    bodyFormData.append('attachment', {
      uri: imageUri,
      name: imageName,
    });

    axios({
      method: 'post',
      url: `${BASE_URL}/attachments/add/${issueId}`,
      data: bodyFormData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + `${userInfo.token}`,
      },
    })
      .then(async res => {
        let attachment_data = res.data;
        console.log('Add an attachment: ', attachment_data);
        setIssueAttachments([attachment_data]);
      })
      .catch(e => {
        console.log(`Add an attachment error: ${e}`);
      });

    console.log('In AddHandler: \n', issueAttachments);
    // ************************************************************ //

    // await SqliteManager.createIssueAttachment(newAttachment);
    
    // // 可能會有多張缺失改善照片
    // const allAttachments = await SqliteManager.getIssueAttachmentsByIssueId(
    //   issueId,
    // );
    // const sortedAttachments = allAttachments.sort(
    //   (a, b) => new Date(b.created_at) - new Date(a.created_at),
    // );
    // const latestAttachments = sortedAttachments[0];

    // const newIssueAttachments = issueAttachments.concat(latestAttachments);
    // console.log('IssueAttachments: ', newIssueAttachments);
    // setIssueAttachments(newIssueAttachments);
  
  }, [issueAttachments, issueId, projectCorporation, projectId, projectName, userInfo.token]);

  // 刪除缺失改善照片
  const attachmentDeleteHandler = index => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['取消', '刪除'],
        destructiveButtonIndex: [1],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light', //'dark'
      },
      async buttonIndex => {
        switch (buttonIndex) {
          case 0: // 取消
            break;
          case 1: // 刪除
            const targetAttachment = issueAttachments.find(
              (_, attIndex) => attIndex === index,
            );
            await SqliteManager.deleteIssueAttachment(targetAttachment.id);
            const newIssueAttachments = issueAttachments.filter(
              attachment => attachment.id !== targetAttachment.id,
            );
            setIssueAttachments(newIssueAttachments);
            break;
        }
      },
    );
  };


  // 缺失改善備註
  const remarkChangeHandler = async (index, remark) => {
    const newIssueAttachments = issueAttachments;
    newIssueAttachments[index].remark = remark;

    const targetIssueAttachment = newIssueAttachments[index];
    await SqliteManager.updateIssueAttachment(
      targetIssueAttachment.id,
      targetIssueAttachment,
    );
    setIssueAttachments(newIssueAttachments);
  };

  // 新增缺失改善照片
  const imageSelectHandler = () => {
    // 底部彈出式選單: 取消, 拍照, 從相簿選取照片
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['取消', '拍照', '從相簿選取照片'],
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light', //'dark'
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0: // 取消
            break;
          case 1: // 拍照
            launchCamera({mediaType: 'photo', saveToPhotos: true}, res => {
              if (res.errorMessage !== undefined) {
                console.error(`code: ${res.errorCode}: ${res.errorMessage}`);
                return;
              }

              if (!res.didCancel) {
                attachmentAddHandler(res.assets[0]);
              }
            });
            break;
          case 2: // 從相簿選取照片
            launchImageLibrary({mediaType: 'photo'}, res => {
              if (res.errorMessage !== undefined) {
                console.error(`code: ${res.errorCode}: ${res.errorMessage}`);
                return;
              }

              if (!res.didCancel) {
                attachmentAddHandler(res.assets[0]);
              }
            });
        }
      },
    );
  };

  // 右上角"匯出"按鈕
  const imageExportHandler = React.useCallback(() => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['取消', '匯出議題圖片'],
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light', //'dark'
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            break; // cancel action
          case 1:
            const shareOption = {
              title: 'MyApp',
              message: '議題圖片',
              url: 'file://' + item.image.uri,
              type: 'image/ief',
              subject: '議題圖片', // for email
            };
            Share.open(shareOption);
            break;
        }
      },
    );
  }, [item.image.uri]);

  // 缺失狀態選單
  const issueStatusClickHandler = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['取消', '無風險', '有風險，須改善', '有風險，須立即改善'],
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light', //'dark'
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            break; // cancel action
          case 1:
            setIssueStatus(ISSUE_STATUS.lowRisk.id);
            break;
          case 2:
            setIssueStatus(ISSUE_STATUS.mediumRisk.id);
            break;
          case 3:
            setIssueStatus(ISSUE_STATUS.highRisk.id);
            break;
        }
      },
    );
  };

  // 點選缺失影像
  const issueImageClickHandler = () => {
    console.log('--- Params in issueImageClickHandler ---');
    console.log(issueLabels);
    navigation.navigate('Photo', {
      issueId: issueId,
      image: item.image,
      issueLabels: issueLabels,       // 傳issueLabels
      setIssueLabels: labels => {     // 傳setIssueLabels()
        setIssueLabels(labels);
      },
    });
  };

  // 
  function decideIssueTypes(violationType) {
    for (let i = 0; i < ISSUE_TYPE[0].titles.length; i++) {
      if (violationType != ISSUE_TYPE[0].titles[i]) {
        //判斷是哪個type
      } else {
        //回傳缺失細頂
        return ISSUE_TYPE[i + 1].type;
      }
    }
  }
  
  // 選取缺失類別(其他)
  const newIssueTypeClickHandler = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: violationType
          ? decideIssueTypes(violationType)
          : ['---請選取缺失類別---'],
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light', //'dark'
      },
      buttonIndex => {
        if (buttonIndex == 0) {
          // cancel action
        } else {
          setIssueType(`${decideIssueTypes(violationType)[buttonIndex]}`);
        }
      },
    );
  };

  // 選取缺失類別(其他之外)
  const violationTypeClickHandler = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [
          '取消',
          '墜落',
          '機械',
          '物料',
          '感電',
          '防護具',
          '穿刺',
          '爆炸',
          '工作場所',
          '搬運',
          '其他',
        ],
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light', //'dark'
      },
      buttonIndex => {
        if (buttonIndex == 0) {
          // cancel action
        } else {
          setViolationType(ISSUE_TYPE[0].titles[buttonIndex - 1]);
          setIssueType('');
        }
      },
    );
  };

  // 選取責任廠商
  const responsibleCorporationclickHandler = async () => {
    // 換回去CorporationListScreen
    navigation.navigate('CorporationList', {
      name: 'List all corporation',
      project_id: projectId,
      setResponsibleCorporation
    });

    // Next line is Old version
    // var options = await SqliteManager.getWorkItemsByProjectId(projectId);
    // var options = new Array();
    
    // // ************************************************************** //
    // const getCorps = async () => {
    //   try {
    //     const res = await axios.get(`${BASE_URL}/corporations/list/${projectId}`);
    //     const data = await res.data;
    //     console.log('In get method corporations: \n', data);
    //     options = data;
    //   } catch (e) {
    //     console.log(`Fetch corporation error: ${e}`);
    //   }
    // };
    // await getCorps();
    // // ************************************************************* //
    // options.push({ corporation_name: '取消' });
    // options.length === 1
    //   ? Alert.alert(
    //       '未新增任何協力廠商',
    //       '請選擇',
    //       [
    //         {
    //           text: '返回',
    //           style: 'cancel',
    //           onPress: () => {
    //             return;
    //           },
    //         },
    //         {
    //           text: '新增',
    //           onPress: () => {
    //             navigation.navigate('CorporationAdd', {
    //               name: 'Create new corporation',
    //               projectId: projectId,
    //             });
    //           },
    //         },
    //       ],
    //       'light',
    //     )
    //   : ActionSheetIOS.showActionSheetWithOptions(
    //       {
    //         options: options.map(item => item.corporation_name),
    //         cancelButtonIndex: options.length - 1,
    //         userInterfaceStyle: 'light',
    //       },
    //       buttonIndex => {
    //         if (buttonIndex == options.length - 1) {
    //           setResponsibleCorporation(responsibleCorporation);
    //         } else {
    //           setResponsibleCorporation(options[buttonIndex].corporation_name);
    //           // setIssueAssigneeText(options[buttonIndex].corporation_manager);
    //           // setIssueAssigneePhoneNumberText(
    //           //   options[buttonIndex].corporation_phone,
    //           // );
    //         }
    //       },
    //     );
  };

  // 選取工項
  const workItemClickHandler = async () => {
    var options = await SqliteManager.getWorkItemsByProjectId(projectId);
    options.push({company: '', name: '取消'});
    options.length == 1
      ? Alert.alert(
          '未新增任何協力廠商',
          '請選擇',
          [
            {
              text: '返回',
              style: 'cancel',
              onPress: () => {
                return;
              },
            },
            {
              text: '新增',
              onPress: () => {
                navigation.navigate('CorporationAdd', {
                  name: 'Create new corporation',
                  projectId: projectId,
                });
              },
            },
          ],
          'light',
        )
      : ActionSheetIOS.showActionSheetWithOptions(
          {
            options: options.map(item => `${item.company} ${item.name}`),
            cancelButtonIndex: options.length - 1,
            userInterfaceStyle: 'light',
          },
          buttonIndex => {
            if (buttonIndex == options.length - 1) {
              setIssueTaskText(issueTaskText);
            } else {
              setIssueTaskText(options[buttonIndex].name);
            }
          },
        );
  };

  // 導向IssueLocationListScreen, 選擇缺失地點
  const IssueLocationListHandler = async () => {
    navigation.navigate('IssueLocationList', {
      projectId: projectId,
      setIssueLocationText,
    });
  };

  // !! 處理新增缺失的action
  const issueCreateHandler = React.useCallback(async () => {
    console.log('/// create ///');
    const transformedIssue = {
      image_uri: item.image.uri,                            // 缺失影像
      image_width: item.image.width,                        // 缺失影像寬
      image_height: item.image.height,                      // 缺失影像高
      violation_type: route.params.violation_type,          // 缺失類別
      type: item.type,                                      // 缺失項目
      type_remark: item.typeRemark,                         // if 類別=='其他', 這裡要填項目說明
      tracking: item.tracking,                              // 追蹤與否
      location: item.location,                              // 缺失地點
      responsible_corporation: item.responsible_corporation,// 責任廠商
      activity: item.activity,                              // 工項
      assignee: item.assignee,                              // will not be stored in new version
      assignee_phone_number: item.assignee_phone_number,    // will not be stored in new version
      safety_manager: item.safetyManager,                   // 紀錄人員
      status: item.status,                                  // 缺失風險高低
      project_id: projectId,
    };

    // ************************************************************ //
    const data = {
      issue_image_width: item.image.width,
      issue_image_height: item.image.height,
      violationType: violationType,
      issueType: issueType,
      issueTrack: issueTrack,
      issueLocationText: issueLocationText,
      responsibleCorporation: responsibleCorporation,
      issueTaskText: issueTaskText,
      issueRecorder: issueSafetyManagerText,                // 紀錄員在原變數中是SafetyManager
      issueStatus: issueStatus,
      projectId: projectId,
      projectName: projectName,
      projectCorporation: projectCorporation,
    };
    const metadata = JSON.stringify(data);
    var bodyFormData = new FormData();
    bodyFormData.append('metadata', metadata);
    bodyFormData.append('issue', {
      uri: item.image.uri,
      name: item.image.fileName,
    });
    
    axios({
      method: 'post',
      url: `${BASE_URL}/issues/add`,
      data: bodyFormData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ` + `${userInfo.token}`,
      },
    })
      .then(async res => {
        let issue_data = res.data;
        console.log('/// new issue ///');
        console.log(issue_data);
        setIssueId(issue_data.issue_id);
      })
      .catch(e => {
        console.log(`Add new issue error: ${e}`);
      });
    // ************************************************************ //  

    // await SqliteManager.createIssue(transformedIssue);

    // const allIssues = await SqliteManager.getAllIssues();
    // const sortedIssues = allIssues.sort(
    //   (a, b) => new Date(b.created_at) - new Date(a.created_at),
    // );
    // const latestIssue = sortedIssues[0];

    // setIssueId(latestIssue.id);
    setAction('update existing issue');
  }, [
    item.activity,
    item.assignee,
    item.assignee_phone_number,
    item.image.height,
    item.image.uri,
    item.image.width,
    item.location,
    item.responsible_corporation,
    item.safetyManager,
    item.status,
    item.tracking,
    item.type,
    item.typeRemark,
    projectId,
    route.params.violation_type,
  ]);

  // !! 處理更新缺失動作
  const issueUpdateHandler = React.useCallback(async () => {
    // const transformedIssue = {
    //   image_uri: item.image.uri,
    //   image_width: item.image.width,
    //   image_height: item.image.height,
    //   tracking: issueTrack,
    //   location: issueLocationText,
    //   activity: issueTaskText,
    //   responsible_corporation: responsibleCorporation,
    //   assignee: issueAssigneeText,
    //   assignee_phone_number: issueAssigneePhoneNumberText,
    //   safety_manager: issueSafetyManagerText,
    //   violation_type: violationType,
    //   type: issueType,
    //   type_remark: issueTypeRemark,
    //   project_id: projectId,
    //   status: issueStatus,
    // };
    
    // ************************************************************ //
    const data = {
      issue_image_width: item.image.width,
      issue_image_height: item.image.height,
      violationType: violationType,
      issueType: issueType,
      issueTrack: issueTrack,
      issueLocationText: issueLocationText,
      responsibleCorporation: responsibleCorporation,
      issueTaskText: issueTaskText,
      issueRecorder: issueSafetyManagerText,                // 紀錄員在原變數中是SafetyManager
      issueStatus: issueStatus,
      projectId: projectId,
      projectName: projectName,
      projectCorporation: projectCorporation,
    };

    axios({
      method: 'patch',
      url: `${BASE_URL}/issues/update/${issueId}`,
      data: data,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ` + `${userInfo.token}`,
      },
    })
      .then(async res => {
        let issue_data = res.data;
        console.log(issue_data);
      })
      .catch(e => {
        console.log(`Update issue error: ${e}`);
      });
    // ************************************************************ //

    // await SqliteManager.updateIssue(issueId, transformedIssue);
  }, [
    issueAssigneeText,
    issueAssigneePhoneNumberText,
    issueId,
    issueLocationText,
    responsibleCorporation,
    issueSafetyManagerText,
    issueTaskText,
    violationType,
    issueType,
    issueTrack,
    issueStatus,
    item,
    projectId,
  ]);

  // 量化project之風險高低指標
  React.useEffect(() => {
    // beforeRemove 用來防止   
    const unsubscribe = navigation.addListener('beforeRemove', async (e) => {

    // ************************************************************ //
    const data = {
      violationType: violationType,                         // 缺失類別
      issueType: issueType,                                 // 缺失項目
      // issueTypeRemark: issueTypeRemark,
      issueTrack: issueTrack,                               // 追蹤與否
      issueLocationText: issueLocationText,                 // 缺失地點
      responsibleCorporation: responsibleCorporation,       // 責任廠商
      issueTaskText: issueTaskText,                         // 工項
      issueRecorder: issueSafetyManagerText,                // 紀錄員在原變數中是SafetyManager
      issueStatus: issueStatus,                             // 風險高低
      projectId: projectId,
      projectName: projectName,
      projectCorporation: projectCorporation,
    };

    // 按下"完成"Button會更新缺失資料到後端
    axios({
      method: 'patch',
      url: `${BASE_URL}/issues/update/${issueId}`,
      data: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ` + `${userInfo.token}`,
      },
    })
      .then(async res => {
        let issue_data = res.data;
        console.log(issue_data);
      })
      .catch(e => {
        console.log(`Update issue error: ${e}`);
      });
    // ************************************************************ // 

      // e.preventDefault();
      // const issues = await SqliteManager.getIssuesByProjectId(projectId);
      // let projectStatus = CalculateProjectStatus(issues);
      // await SqliteManager.updateProject(projectId, {status: projectStatus});
    });

    return unsubscribe;
  }, [issueId, issueLocationText, issueSafetyManagerText, issueStatus, issueTaskText, issueTrack, issueType, navigation, projectCorporation, projectId, projectName, responsibleCorporation, userInfo.token, violationType]);

  // 計算project之風險高低指標的function
  // const CalculateProjectStatus = issues => {
  //   let sum = 0;
  //   issues.map(
  //     i =>
  //       (sum += getIssueStatusById(i.status)
  //         ? getIssueStatusById(i.status).value
  //         : 0),
  //   );
  //   let risk = Math.ceil(sum / issues.length);
  //   if (risk === 1) return PROJECT_STATUS.lowRisk.id;
  //   else if (risk === 2) return PROJECT_STATUS.mediumRisk.id;
  //   else if (risk === 3) return PROJECT_STATUS.highRisk.id;
  //   else return PROJECT_STATUS.lowRisk.id;
  // };

  // 重要(處理labels)
  useEffect(() => {
    // 取得照片標註
    const fetchLabels = async () => {
      await axios
        .get(`${BASE_URL}/labels/list/${issueId}`)
        .then((res) => {
          setIssueLabels(
            res.data.map(label => (
                {
                  box:{
                    maxX: label.max_x,
                    maxY: label.max_y,
                    minX: label.min_x,
                    minY: label.min_y
                  },
                  key: `${label.label_id}`,
                  mode: `${label.label_mode}`,
                  name: `${label.label_name}`,
                  path: JSON.parse(label.label_path),
                }
              )
            )
          )
        })
        .catch((e) => {
          console.log(`list labels error: ${e}`);
        });
    };  

    if (isFocused) {
      fetchLabels();
    }
  }, [isFocused]);

  // 看IssueListScreen傳來的action是什麼, 決定create或update
  useEffect(() => {
    // action = 'create new issue' 就執行 issueCreateHandler()
    action === 'create new issue' && issueCreateHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueCreateHandler]);

  useEffect(() => {
    // action = 'update existing issue' 且 有issueId存在 就執行 issueUpdateHandler()
    action === 'update existing issue' && issueId && issueUpdateHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    issueId,
    issueLocationText,
    issueTaskText,
    responsibleCorporation,
    issueAssigneeText,
    issueAssigneePhoneNumberText,
    issueSafetyManagerText,
    issueType,
    violationType,
    issueTrack,
    issueStatus,
    issueUpdateHandler,
  ]);

  useEffect(() => {
    issueId && issueAttachments && attachmentAddHandler();
  }, [
    issueId,
    issueAttachments,
    attachmentAddHandler,
  ]);

  // 功能未知: 應不影響其他功能
  useEffect(() => {
    keyboardDidShowListener.current = Keyboard.addListener(
      'keyboardWillShow',
      onKeyboardShow,
    );
    keyboardDidHideListener.current = Keyboard.addListener(
      'keyboardWillHide',
      onKeyboardHide,
    );

    return () => {
      keyboardDidShowListener.current.remove();
      keyboardDidHideListener.current.remove();
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <React.Fragment>
          <Button title="匯出" onPress={() => imageExportHandler()} />
        </React.Fragment>
      ),
      headerLeft: () => (
        <Button
          title="完成"
          onPress={async (req, res) => {
            if (!violationType) {
              Alert.alert('請點選缺失類別');
              return;
            } 
            else if (!issueType) {
              Alert.alert('請點選缺失項目');
              return;
            } 
            else if (!issueLocationText) {
              Alert.alert('請點選缺失地點');
              return;
            }/*
            else if (!responsibleCorporation) {
              Alert.alert('請點選責任廠商');
              return;
            }*/
            else {
            // 將紀錄完成之缺失資料更新至後端
            // ************************************************************ //
            const data = {
              violationType: violationType,                         // 缺失類別
              issueType: issueType,                                 // 缺失項目
              // issueTypeRemark: issueTypeRemark,
              issueTrack: issueTrack,                               // 追蹤與否
              issueLocationText: issueLocationText,                 // 缺失地點
              responsibleCorporation: responsibleCorporation,       // 責任廠商
              issueTaskText: issueTaskText,                         // 工項
              issueRecorder: issueSafetyManagerText,                // 紀錄員在原變數中是SafetyManager
              issueStatus: issueStatus,                             // 風險高低
              projectId: projectId,
              projectName: projectName,
              projectCorporation: projectCorporation,
            };

            // 按下"完成"Button會更新缺失資料到後端
            axios({
              method: 'patch',
              url: `${BASE_URL}/issues/update/${issueId}`,
              data: data,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ` + `${userInfo.token}`,
              },
            })
              .then(async res => {
                let issue_data = res.data;
                console.log(issue_data);
              })
              .catch(e => {
                console.log(`Update issue error: ${e}`);
              });
            // ************************************************************ //
            navigation.goBack();
          }}}
        />
      ),
    });
  }, [issueId, isFocused, imageExportHandler, navigation, issueTrack, violationType, issueType, issueLocationText, issueTaskText, responsibleCorporation, issueAssigneeText, issueAssigneePhoneNumberText, issueSafetyManagerText, issueStatus, item.image.uri, item.image.fileName, projectId, projectName, projectCorporation, userInfo.token]);

  // 畫面欄位
  return (
    <React.Fragment>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View>
            {/* 可顯示label的bounding box */}
            <PhotoLabelViewer image={item.image} labels={issueLabels} item={item}/>
            {/* <RemoteImageWithSketch image={item.image} labels={issueLabels} item={item}/> */}
            <TouchableOpacity
              style={[
                styles.image,
                {width: windowSize.width, height: (item.image.height * windowSize.width) / item.image.width},
              ]}
              onPress={() => issueImageClickHandler()}
            />
          </View>
          <View style={styles.group}>
            <TouchableOpacity onPress={() => violationTypeClickHandler()}>
              <View style={styles.item}>
                <Text style={styles.title}>缺失類別</Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.description}>
                    {violationType ? violationType : '選取缺失類別'}
                  </Text>
                  <Ionicons
                    style={styles.description}
                    name={'ios-chevron-forward'}
                  />
                </View>
              </View>
            </TouchableOpacity>
            <Separator />
            {violationType != '其他' ? (
              <React.Fragment>
                <TouchableOpacity onPress={() => newIssueTypeClickHandler()}>
                  <View style={styles.item}>
                    <Text style={styles.title}>缺失項目</Text>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.description}>
                        {issueType ? issueType : '選取缺失項目'}
                      </Text>
                      <Ionicons
                        style={styles.description}
                        name={'ios-chevron-forward'}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                <Separator />
              </React.Fragment>
            ) : undefined}
            {violationType == '其他' ? (
              <React.Fragment>
                <View style={styles.item}>
                  <Text style={styles.title}>缺失項目</Text>
                  <View style={{flexDirection: 'row'}}>
                    <TextInput
                      style={styles.textInput}
                      onChangeText={setIssueType}
                      defaultValue={issueType}
                    />
                  </View>
                </View>
                <Separator />
              </React.Fragment>
            ) : undefined}
            <TouchableOpacity onPress={IssueLocationListHandler}>
              <View style={styles.item}>
                <Text style={styles.title}>缺失地點</Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.textInput}>
                    {!!issueLocationText ? issueLocationText : undefined}
                  </Text>
                  <Ionicons
                    style={styles.description}
                    name={'ios-chevron-forward'}
                  />
                </View>
              </View>
            </TouchableOpacity>
            <Separator />
            <TouchableOpacity onPress={responsibleCorporationclickHandler}>
              <View style={styles.item}>
                <Text style={styles.title}>責任廠商</Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.textInput}>
                    {!!responsibleCorporation
                      ? responsibleCorporation
                      : undefined}
                  </Text>
                  <Ionicons
                    style={styles.description}
                    name={'ios-chevron-forward'}
                  />
                </View>
              </View>
            </TouchableOpacity>
            <Separator />
            <TouchableOpacity onPress={workItemClickHandler}>
              <View style={styles.item}>
                <Text style={{fontSize: 18, color: '#8C8C8C'}}>工項(選填)</Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.textInput}>
                    {!!issueTaskText ? issueTaskText : undefined}
                  </Text>
                  <Ionicons
                    style={styles.description}
                    name={'ios-chevron-forward'}
                  />
                </View>
              </View>
            </TouchableOpacity>
            <Separator />
            {/* <View style={styles.item}>
              <Text style={styles.title}>記錄人員</Text>
              <View style={{flexDirection: 'row'}}>
                <TextInput
                  style={styles.textInput}
                  onChangeText={setIssueSafetyManagerText}
                  defaultValue={issueSafetyManagerText}
                />
              </View>
            </View>
            <Separator /> */}
            <View style={styles.item}>
              <Text style={styles.title}>狀態</Text>
              <TouchableOpacity onPress={() => issueStatusClickHandler()}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.textInput}>
                    {!!getIssueStatusById(issueStatus)
                      ? getIssueStatusById(issueStatus).name
                      : undefined}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <Separator />
            <View style={styles.item}>
              <Text style={styles.title}>追蹤缺失</Text>
              <View style={{flexDirection: 'row'}}>
                <Switch
                  onValueChange={() => issueTrackToggleHandler()}
                  value={issueTrack}
                />
              </View>
            </View>
          </View>
          <View style={styles.group}>
            {issueAttachments[0] ? (
              issueAttachments.map((a, i) => {
                return (
                  <View key={`issue_attachment_${i}`}>
                    <View style={{marginBottom: 15, ...styles.item}}>
                      <Text style={styles.title}>已改善照片</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => attachmentDeleteHandler(i)}>
                      {/* <Image style={styles.itemImage} source={{uri: a.image}} /> */}
                      <FastImage 
                        style={styles.itemImage} 
                        source={{
                          uri: `${BASE_URL}/attachments/get/thumbnail/${issueAttachments[0].attachment_id}`,
                        }}
                      />
                    </TouchableOpacity>
                    <View style={{marginBottom: 15, ...styles.item}}>
                      <Text style={styles.title}>備註：</Text>
                      <TextInput
                        id={a.id}
                        key={a.id}
                        style={styles.textInput}
                        onChangeText={text => remarkChangeHandler(i, text)}
                        defaultValue={a.remark}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.item}>
                <Text style={styles.title}>缺失改善</Text>
                <TouchableOpacity onPress={() => imageSelectHandler()}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{color: 'goldenrod', fontSize: 18}}>
                      新增已改善照片
                    </Text>
                    <Ionicons
                      style={{color: 'goldenrod', fontSize: 22}}
                      name={'ios-add-circle-outline'}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}
            {/* 原寫法
              {issueAttachments ? (
                issueAttachments.map((a, i) => {
                  return (
                    <View key={`issue_attachment_${i}`}>
                      <View style={{marginBottom: 15, ...styles.item}}>
                        <Text style={styles.title}>已改善照片</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => attachmentDeleteHandler(i)}>
                        <FastImage 
                          style={styles.itemImage} 
                          source={{
                            uri: `${BASE_URL}/attachments/get/thumbnail/1ac31ef2-7972-48a2-9ba0-cc2d184b1868`
                          }} 
                        />
                      </TouchableOpacity>
                      <View style={{marginBottom: 15, ...styles.item}}>
                        <Text style={styles.title}>備註：</Text>
                        <TextInput
                          id={a.id}
                          key={a.id}
                          style={styles.textInput}
                          onChangeText={text => remarkChangeHandler(i, text)}
                          defaultValue={a.remark}
                          onSubmitEditing={Keyboard.dismiss}
                        />
                      </View>
                    </View>
                  );
                })
              ) : (
                <></>
              )}
            */}
          </View>
          <View style={{marginBottom: keyboardOffset}} />
        </ScrollView>
      </SafeAreaView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  text: {
    fontSize: 24,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  itemImage: {
    width: '100%',
    height: 200,
  },
  group: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 20,
    marginTop: 15,
  },
  item: {
    paddingVertical: 15,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
  },
  description: {
    fontSize: 18,
    color: 'gray',
  },
  textInput: {
    fontSize: 18,
    color: 'gray',
    width: 180,
    textAlign: 'right',
  },
});

export default IssueScreen;
