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
// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';
// import RNFetchBlob from 'rn-fetch-blob';
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

const IssueScreen = ({navigation, route}) => {
  console.log(route.params);
  let project = route.params.project;
  console.log(project.project_id);
  const item = route.params.item;
  const projectId = project.project_id;
  const projectName = project.project_name;
  const projectCorporation = project.project_corporation;
  const {userInfo} = useContext(AuthContext);
  const isFocused = useIsFocused();
  const [action, setAction] = useState(route.params.action);
  const [issueId, setIssueId] = useState(item.id);
  const [selectedIssueLocationId, setSelectedIssueLocationId] = useState(null);   //
  const [violationType, setViolationType] = useState(
    route.params.violation_type
      ? route.params.violation_type
      : item.violation_type,
  );
  const [issueType, setIssueType] = useState(item.type);
  const [issueTypeRemark, setIssueTypeRemark] = useState(item.type_remark);
  const [issueTrack, setIssueTrack] = useState(item.tracking);
  const [issueLocationText, setIssueLocationText] = useState(item.location);
  const [issueTaskText, setIssueTaskText] = useState(item.activity);
  const [responsibleCorporation, setResponsibleCorporation] = useState(
    item.responsible_corporation,
  );
  const [issueAssigneeText, setIssueAssigneeText] = useState(item.assignee);
  const [issueAssigneePhoneNumberText, setIssueAssigneePhoneNumberText] =
    useState(item.assignee_phone_number);
  const [issueSafetyManagerText, setIssueSafetyManagerText] = useState(
    userInfo.user.name,
  );
  const [issueAttachments, setIssueAttachments] = useState(item.attachments);
  const [issueLabels, setIssueLabels] = useState(transformLabels(item.labels));
  const [issueStatus, setIssueStatus] = useState(item.status);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const keyboardDidShowListener = useRef();
  const keyboardDidHideListener = useRef();

  const onKeyboardShow = event =>
    setKeyboardOffset(event.endCoordinates.height);
  const onKeyboardHide = () => setKeyboardOffset(0);

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

  const attachmentAddHandler = async image => {
    const imageUri = image.uri;
    const transformedImageUri = imageUri.replace('file://', '');

    const newAttachment = {
      image: transformedImageUri,
      remark: '',
      issue_id: issueId,
    };

    await SqliteManager.createIssueAttachment(newAttachment);

    const allAttachments = await SqliteManager.getIssueAttachmentsByIssueId(
      issueId,
    );
    const sortedAttachments = allAttachments.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    const latestAttachments = sortedAttachments[0];

    const newIssueAttachments = issueAttachments.concat(latestAttachments);
    setIssueAttachments(newIssueAttachments);
  };

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
          case 0: // cancel action
            break;
          case 1:
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

  const imageSelectHandler = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['取消', '拍照', '從相簿選取照片'],
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light', //'dark'
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0: // cancel action
            break;
          case 1:
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
          case 2:
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

  const issueStatusClickHandler = () => {
    // Geolocation.getCurrentPosition(  //gps測試用
    //   success= (
    //     info => console.log(info)),
    //   error= (
    //     error => error.message=="User denied access to location services."?Alert.alert('未允許使用位置'):console.log(error)),
    //   options= {
    //       timeout: 0,
    //       maximumAge: 0,
    //       enableHighAccuracy: true
    //   }
    // ),
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

  const issueImageClickHandler = () => {
    navigation.navigate('Photo', {
      issueId: issueId,
      image: item.image,
      issueLabels: issueLabels,
      setIssueLabels: labels => {
        setIssueLabels(labels);
      },
    });
  };

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

  const responsibleCorporationclickHandler = async () => {
    var options = await SqliteManager.getWorkItemsByProjectId(projectId);
    options.push({company: '取消'});
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
            options: options.map(item => item.company),
            cancelButtonIndex: options.length - 1,
            userInterfaceStyle: 'light',
          },
          buttonIndex => {
            if (buttonIndex == options.length - 1) {
              setResponsibleCorporation(responsibleCorporation);
            } else {
              setResponsibleCorporation(options[buttonIndex].company);
              setIssueAssigneeText(options[buttonIndex].manager);
              setIssueAssigneePhoneNumberText(
                options[buttonIndex].phone_number,
              );
            }
          },
        );
  };

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

  const IssueLocationListHandler = async () => {
    navigation.navigate('IssueLocationList', {
      project: route.params.project,
      projectId: route.params.projectId,
      setIssueLocationText,
    });
  };

  const issueCreateHandler = React.useCallback(async () => {
    const transformedIssue = {
      image_uri: item.image.uri.replace('file://', ''),
      image_width: item.image.width,
      image_height: item.image.height,
      tracking: item.tracking,
      location: item.location,
      responsible_corporation: item.responsible_corporation,
      activity: item.activity,
      assignee: item.assignee,
      assignee_phone_number: item.assignee_phone_number,
      safety_manager: item.safetyManager,
      violation_type: route.params.violation_type,
      type: item.type,
      status: item.status,
      type_remark: item.typeRemark,
      project_id: projectId,
    };

    await SqliteManager.createIssue(transformedIssue);

    const allIssues = await SqliteManager.getAllIssues();
    const sortedIssues = allIssues.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    const latestIssue = sortedIssues[0];

    setIssueId(latestIssue.id);
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

  const issueUpdateHandler = React.useCallback(async () => {
    const transformedIssue = {
      image_uri: item.image.uri.replace('file://', ''),
      image_width: item.image.width,
      image_height: item.image.height,
      tracking: issueTrack,
      location: issueLocationText,
      activity: issueTaskText,
      responsible_corporation: responsibleCorporation,
      assignee: issueAssigneeText,
      assignee_phone_number: issueAssigneePhoneNumberText,
      safety_manager: issueSafetyManagerText,
      violation_type: violationType,
      type: issueType,
      type_remark: issueTypeRemark,
      project_id: projectId,
      status: issueStatus,
    };
    await SqliteManager.updateIssue(issueId, transformedIssue);
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
    issueTypeRemark,
    issueTrack,
    issueStatus,
    item,
    projectId,
  ]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async () => {
      const issues = await SqliteManager.getIssuesByProjectId(projectId);
      let projectStatus = CalculateProjectStatus(issues);
      await SqliteManager.updateProject(projectId, {status: projectStatus});
    });

    return unsubscribe;
  }, [navigation, projectId]);

  const CalculateProjectStatus = issues => {
    let sum = 0;
    issues.map(
      i =>
        (sum += getIssueStatusById(i.status)
          ? getIssueStatusById(i.status).value
          : 0),
    );
    let risk = Math.ceil(sum / issues.length);
    if (risk === 1) return PROJECT_STATUS.lowRisk.id;
    else if (risk === 2) return PROJECT_STATUS.mediumRisk.id;
    else if (risk === 3) return PROJECT_STATUS.highRisk.id;
    else return PROJECT_STATUS.lowRisk.id;
  };

  useEffect(() => {
    action === 'create new issue' && issueCreateHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueCreateHandler]);

  useEffect(() => {
    console.log(action);
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
    issueTypeRemark,
    issueTrack,
    issueStatus,
    issueUpdateHandler,
  ]);

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
            } else if (!issueType && !issueTypeRemark) {
              Alert.alert('請點選缺失項目');
              return;
            } else if (!issueLocationText) {
              Alert.alert('請點選缺失地點');
              return;
            } /*else if (!responsibleCorporation) {
              Alert.alert('請點選責任廠商');
              return;
            } */ else if (!issueSafetyManagerText) {
              Alert.alert('請填寫記錄人員');
              return;
            } else {
              const data = {
                violationType: violationType,
                issueType: issueType,
                issueTrack: issueTrack,
                issueLocationText: issueLocationText,
                responsibleCorporation: responsibleCorporation,
                issueTaskText: issueTaskText,
                issueAssigneeText: issueAssigneeText,
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
                  console.log(res);
                  let issue_data = res.data;
                  console.log(issue_data);
                })
                .catch(e => {
                  console.log(`Add new issue error: ${e}`);
                });
            }
            navigation.goBack();
          }}
        />
      ),
    });
  }, [imageExportHandler, navigation, issueTrack, violationType, issueType, issueLocationText, issueTaskText, responsibleCorporation, issueAssigneeText, issueAssigneePhoneNumberText, issueSafetyManagerText, issueStatus, issueTypeRemark, item.image.uri, item.image.fileName]);

  return (
    <React.Fragment>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View>
            <PhotoLabelViewer image={item.image} labels={issueLabels} />
            <TouchableOpacity
              style={[
                styles.image,
                {width: item.image.width, height: item.image.height},
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
                  <Text style={styles.title}></Text>
                  <View style={{flexDirection: 'row'}}>
                    <TextInput
                      style={styles.textInput}
                      onChangeText={setIssueTypeRemark}
                      defaultValue={issueTypeRemark}
                    />
                  </View>
                </View>
                <Separator />
              </React.Fragment>
            ) : undefined}
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
            <View style={styles.item}>
              <Text style={styles.title}>記錄人員</Text>
              <View style={{flexDirection: 'row'}}>
                <TextInput
                  style={styles.textInput}
                  onChangeText={setIssueSafetyManagerText}
                  defaultValue={issueSafetyManagerText}
                />
              </View>
            </View>
            <Separator />
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
          </View>

          <View style={styles.group}>
            {issueAttachments[0] ? undefined : (
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
            {issueAttachments ? (
              issueAttachments.map((a, i) => {
                return (
                  <View key={`issue_attachment_${i}`}>
                    <View style={{marginBottom: 15, ...styles.item}}>
                      <Text style={styles.title}>已改善照片</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => attachmentDeleteHandler(i)}>
                      <Image style={styles.itemImage} source={{uri: a.image}} />
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
