import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Button,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swipeout from 'react-native-swipeout';
import Separator from '../../components/Separator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Badge, Icon } from 'react-native-elements';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import SqliteManager from '../../services/SqliteManager';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import { useIsFocused } from '@react-navigation/native';
import { transformIssues, transformExportIssues } from '../../util/sqliteHelper';
import { ISSUE_STATUS , getIssueStatusById } from './IssueEnum';
import { AlignmentType, Document, Packer, Paragraph, Table, TextRun, UnderlineType } from "docx";
import { IssueRowsGenerator, ImprovePagesGenerator } from './OutputTable';
import IssueAttachment from '../../models/IssueAttachment';
import { ISSUE_ATTACHMENT } from '../../data/issueAttachment';
import { getIssuesByProjectId } from '../../services/SqliteManager'




// import { MobileModel, Image } from "react-native-pytorch-core";

const determineStatusColor = item => {
  let color = 'grey';
  if(item.status==0)
    color = 'limegreen';
  if(item.status==1)
    color = 'gold';
  if(item.status==2)
    color = 'orangered';

  return color;
};

const IssueListScreen = ({ navigation, route }) => {
  const [projectId, setProjectId] = useState(null);
  const [project, setProject] = useState({});
  const [issueList, setIssueList] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const isFocused = useIsFocused();


  const issueDeleteHandler = async () => {
    Alert.alert(
      "刪除議題",
      "真的要刪除議題嗎？",
      [
        {
          text: "取消",
          onPress: () => {console.log("Cancel delete issue")},
          style: "cancel"
        },
        {
          text: "確定", onPress: async () => {
            await SqliteManager.deleteIssue(selectedIssueId);
            setIssueList(issueList.filter(i => i.id !== selectedIssueId));
          },
          style: "destructive"
        }
      ]
    );
  };

  const issueSelectHandler = item => {
    setSelectedIssueId(item.id);
    navigation.navigate('Issue', {
      projectId: projectId,
      action: 'update existing issue',
      item,
    });
  };

  const issueSortHandler = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['取消', '依時間排序', '依追蹤缺失數量排序'],
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light', //'dark'
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            break; // cancel action
          case 1:
            issueList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setIssueList([...issueList]);
            break;
          case 2:
            issueList.sort((a, b) => b.attachments.length - a.attachments.length);
            setIssueList([...issueList]);
            break;
        }
      },
    );
  }

  const issueOptionHandler = React.useCallback(() => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['取消', '匯出專案資訊', '匯出專案圖片', '匯出完整缺失記錄表', '匯出缺失改善前後記錄表'],
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light', //'dark'
      },
      async buttonIndex => {
        const fs = RNFetchBlob.fs;
        const dirs = RNFetchBlob.fs.dirs;
        const docPath = dirs.DocumentDir;
        const projectName = route.params.name;
        // const base64 = RNFetchBlob.base64;

        switch (buttonIndex) {
          case 0:
            break; // cancel action
          case 1:
            await fs.writeFile(
              `${docPath}/${projectName}-data.json`,
              JSON.stringify(transformExportIssues(issueList)),
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
            break;
          case 2:
            let urls = issueList.map(issue => 'file://' + issue.image.uri);
            issueList.map(issue =>
              issue.attachments.map(
                att => (urls = urls.concat('file://' + att.image)),
              ),
            );

            const shareImageOption = {
              title: 'MyApp',
              message: `${projectName}-image`,
              urls,
              subject: `${projectName}-image`, // for email
            };
            await Share.open(shareImageOption);
            break;
          case 3:
            const doc = new Document({
              sections: [
                  {
                      properties: {},
                      children: [
                          new Paragraph({children:[new TextRun({text: "缺失記錄表", size: 40, bold: true,  })], alignment:AlignmentType.CENTER}),
                          new Paragraph({
                              children: [
                                  new TextRun({text: "工程名稱：", size: 30, bold: true}),
                                  new TextRun({text: `${projectName}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                                  new TextRun({text:"\t\t巡檢人員：", size: 30, bold: true}),
                                  new TextRun({text: `${project.inspector}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                              ], alignment:AlignmentType.CENTER
                          }),
                          new Paragraph({
                            children: [
                                new TextRun({text: "地址：", size: 30, bold: true}),
                                new TextRun({text: `${project.address}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                                new TextRun({text:"\t專案建立日期：", size: 30, bold: true}),
                                new TextRun({text: `${new Date(project.created_at).getFullYear()}/${new Date(project.created_at).getMonth()+1}/${new Date(project.created_at).getDate()}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                            ], alignment:AlignmentType.CENTER
                          }),
                          table = new Table({
                            rows: IssueRowsGenerator(issueList,fs),
                            alignment:AlignmentType.CENTER,
                          }),

                      ],
                  },
              ],
          });

            await Packer.toBase64String(doc).then((base64) => {
              fs.writeFile(`${docPath}/${projectName}-完整缺失記錄表.docx`, 
              base64,
              'base64'
              );
          });

            const shareDataTableOption = {
              title: 'MyApp',
              message: `${projectName}-完整缺失記錄表`,
              url: `file://${docPath}/${projectName}-完整缺失記錄表.docx`,
              type: 'application/docx',
              subject: `${projectName}-完整缺失記錄表`, // for email
            };

            await Share.open(shareDataTableOption); // ...after the file is saved, send it to a system share intent
            break;
        
          case 4:
            const doc_2 = new Document({
              sections: [
                  {
                      properties: {},
                      children: ImprovePagesGenerator(issueList,fs,project,projectName),
                  },
              ],
          });

            await Packer.toBase64String(doc_2).then((base64) => {
              fs.writeFile(`${docPath}/${projectName}-缺失改善前後記錄表.docx`, 
              base64,
              'base64'
              );
          });

            const shareDataTableOption_2 = {
              title: 'MyApp',
              message: `${projectName}-缺失改善前後記錄表`,
              url: `file://${docPath}/${projectName}-缺失改善前後記錄表.docx`,
              type: 'application/docx',
              subject: `${projectName}-缺失改善前後記錄表`, // for email
            };

            await Share.open(shareDataTableOption_2); // ...after the file is saved, send it to a system share intent
            break;
        }
      },
    );
  }, [issueList, route.params.name]);

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
            launchCamera({ mediaType: 'photo', saveToPhotos: true }, res => {
              //includeBase64: true --> return base64Image
              if (res.errorMessage !== undefined) {
                console.error(`code: ${res.errorCode}: ${res.erroMessage}`);
                return;
              }

              if (!res.didCancel) {
                const image = res.assets[0];
                navigation.navigate('Issue', {
                  projectId: projectId,
                  action: 'create new issue',
                  item: CreateItemByImage(image),
                });
              }
            });
            break;
          case 2:
            launchImageLibrary({ mediaType: 'photo' }, res => {
              if (res.errorMessage !== undefined) {
                console.error(`code: ${res.errorCode}: ${res.erroMessage}`);
                return;
              }

              if (!res.didCancel) {
                const image = res.assets[0];
                navigation.navigate('Issue', {
                  projectId: projectId,
                  action: 'create new issue',
                  item: CreateItemByImage(image),
                });
              }
            });
            break;
        }
      },
    );
  };

  useEffect(() => {
    const fetchIssues = async () => {
      const project = await SqliteManager.getProjectByName(route.params.name);
      const issues = await SqliteManager.getIssuesByProjectId(project.id);
      const getHydratedIssuePromises = issues.map(issue =>
        SqliteManager.getHydratedIssue(issue.id),
      );
      const hydratedIssues = await Promise.all(getHydratedIssuePromises);
      const transformedIssues = transformIssues(hydratedIssues);
      const sortedIssues = transformedIssues.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );

      setIssueList(sortedIssues);
      setProjectId(project.id);
      setProject(project);
    };

    if (isFocused) {
      fetchIssues();
    }
  }, [route.params.name, isFocused]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <React.Fragment>
          <Button title="排序" onPress={issueSortHandler} />
          <Button title="選項" onPress={issueOptionHandler} />
        </React.Fragment>
      ),
    });
  }, [issueOptionHandler, navigation]);

  const swipeBtns = [
    {
      text: <Ionicons name={'ios-trash'} size={24} color={'white'} />,
      backgroundColor: 'red',
      underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
      onPress: () => issueDeleteHandler(),
    },
  ];

  const CreateItemByImage = image => {
    image.uri = image.uri.replace('file://', '');

    return {
      id: '',
      title: '',
      type: '',
      image,
      status: ISSUE_STATUS.lowRisk.id,
      tracking: false,
      location: project.name,
      activity: '',
      assignee: '',
      safetyManager: project.inspector,
      attachments: [],
      labels: [],
      timestamp: new Date().toISOString(),
    };
  };

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <Swipeout
      key={item.id}
      right={swipeBtns}
      onOpen={() => setSelectedIssueId(item.id)}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.item, backgroundColor]}>
        <View style={styles.panelLeftContainer}>
          <Image style={styles.image} source={{ uri: item.image.uri.replace('file://', '') }} />
          {
            item.tracking ? (<Badge
              status="primary"
              containerStyle={styles.badge}
              value={item.attachments.length}
            />) : undefined
          }
        </View>
        <View style={styles.panelRightContainer}>
          <View style={styles.timestampContainer}>
            <Ionicons
              style={styles.status}
              name={'ios-ellipse'}
              size={16}
              color={determineStatusColor(item)}
            />
            <Text style={[styles.timestampText, textColor]}>
              {new Date(item.timestamp).toISOString()}
            </Text>
          </View>
          <Text style={[styles.descriptionText, textColor]}>{item.title}</Text>
          <View style={styles.objLabelAreaContainer}>
            {Array.isArray(item.labels) ? (
              item.labels.map((label, i) => {
                return (
                  <View
                    key={`item_object_${i}`}
                    style={styles.objLabelContainer}>
                    <Text style={styles.objLabelTxt}>{label.name}</Text>
                  </View>
                );
              })
            ) : (
              <></>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeout>
  );

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedIssueId ? 'white' : 'white'; //"#6e3b6e" : "#f9c2ff";
    const color = item.id === selectedIssueId ? 'black' : 'black'; //'white' : 'black';
    return (
      <React.Fragment>
        <Item
          key={`${item.id}`}
          item={item}
          onPress={() => issueSelectHandler(item)}
          backgroundColor={{ backgroundColor }}
          textColor={{ color }}
        />
        <Separator key={`seperator_${item.id}`} />
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <SafeAreaView style={styles.container}>
        <FlatList
          ListHeaderComponent={<Separator />}
          data={issueList}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          extraData={selectedIssueId}
        />
        <View style={styles.addPhotoBtn}>
          <Icon
            raised
            name="ios-add"
            type="ionicon"
            color="dodgerblue"
            size={32}
            iconStyle={{ fontSize: 52, marginLeft: 4 }}
            onPress={() => imageSelectHandler()}
          />
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    padding: 5,
    flex: 1,
    flexDirection: 'row',
    // marginVertical: 8,
    // marginHorizontal: 16,
    height: 140,
  },
  panelLeftContainer: {
    width: '45%',
  },
  image: {
    height: '100%',
    borderRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  panelRightContainer: {
    paddingLeft: 12,
    width: '55%',
    flex: 1,
    flexDirection: 'column',
  },
  timestampContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  timestampText: {
    marginLeft: 5,
    fontSize: 12,
  },
  status: {
    marginTop: 0,
  },
  descriptionText: {
    fontSize: 20,
  },
  objLabelAreaContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 8,
  },
  objLabelContainer: {
    marginLeft: 2,
    marginRight: 2,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
    backgroundColor: 'gray',
    height: 20,
  },
  objLabelTxt: {
    fontSize: 16,
    color: 'white',
  },
  addPhotoBtn: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'flex-end',
    marginBottom: 15,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOpacity: 0.8,
    shadowRadius: 13,
    shadowOffset: { width: 3, height: 8 },
  },
});







export default IssueListScreen;
