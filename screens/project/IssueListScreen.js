/* eslint-disable prettier/prettier */
import React, {useEffect, useState, useContext} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import Swipeout from 'react-native-swipeout';
import Separator from '../../components/Separator';
// import PopUpMenu from '../../components/PopUpMenu';
import SortButton from '../../components/SortButton';
import ExportButton from '../../components/ExportButton';
import FilterButton from '../../components/FilterButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Badge, Icon} from 'react-native-elements';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import SqliteManager from '../../services/SqliteManager';
import RNFetchBlob from 'rn-fetch-blob';
import {useIsFocused} from '@react-navigation/native';
import { AuthContext } from "../../context/AuthContext";
import {ISSUE_STATUS} from './IssueEnum';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import { BASE_URL } from '../../configs/authConfig';
import { MultipleSelectList } from 'react-native-dropdown-select-list'
// import { MobileModel, Image } from "react-native-pytorch-core";

// 定義缺失風險指標
const determineStatusColor = item => {
  let color = 'grey';
  if (item.issue_status === '0') color = 'limegreen';
  if (item.issue_status === '1') color = 'gold';
  if (item.issue_status === '2') color = 'orangered';

  return color;
};

const IssueListScreen = ({navigation, route}) => {
  // console.log(route.params.project);
  // const project = route.params;
  const [project, setProject] = useState(route.params.project);
  const [issueList, setIssueList] = useState([]);
  const [selectedIssueList, setSelectedIssueList] = useState([]);
  const [filteredIssueList, setFilterIssueList] = useState([])
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [isDedecting, setIsDedecting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState([]);
  const isFocused = useIsFocused();
  const { showActionSheetWithOptions } = useActionSheet();
  const {userInfo} = useContext(AuthContext);

  function issuesFilter(Issues) {
    var a = [];
    for (let i = 0; i < Issues.length; i++) {
      if (
        new Date(selectedEndDate).getTime() + 43200000 >= //選的時間都是中午12點，所以往「後」12小時變成00：00
          new Date(Issues[i].create_at).getTime() &&
        new Date(selectedStartDate).getTime() - 43200000 <= //選的時間都是中午12點，所以往「前」12小時變成00：00
          new Date(Issues[i].create_at).getTime()
      ) {
        a.push(Issues[i]);
      }
    }
    return a;
  }

  // @處理刪除缺失動作
  const issueDeleteHandler = async () => {
    Alert.alert('刪除議題', '真的要刪除議題嗎？', [
      {
        text: '取消',
        onPress: () => {
          console.log('Cancel delete issue');
        },
        style: 'cancel',
      },
      {
        text: '確定',
        onPress: async () => {
          await SqliteManager.deleteIssue(selectedIssueId);
          selectedEndDate || filteredIssueList.length !== 0 
            ? setFilterIssueList(
                issueList.filter(i => i.id !== selectedIssueId),
              )
            : setIssueList(issueList.filter(i => i.id !== selectedIssueId));
        },
        style: 'destructive',
      },
    ]);
  };

  // @處理更新缺失動作, 導入IssueScreen
  // action為"update existing issue"
  const issueSelectHandler = async item => {
    console.log('/// item in issueSeleceHandler ///');
    let issueId = item.issue_id;
    setSelectedIssueId(item.issue_id);
    console.log('item',item);

    var attach;
    await axios({
      methods: 'get',
      url: `${BASE_URL}/attachments/list/${issueId}`,
    })
      .then(async res => {
        attach = await res.data;
        console.log(`In issueSelectHandler: \n`, attach);
      })
      .catch(e => {
        console.log(`${e}`);
      });

    await RNFetchBlob.config({             //先將圖片暫時載到本地端
      fileCache: true,
    })
      .fetch('GET', `${BASE_URL}/issues/get/thumbnail/${item.issue_id}`)
      .then((res) => {
        console.log('imagepath',res.data);
        navigation.navigate('Issue', {
          project: project,
          issueId: issueId,                                 // 更新issue時要知道issueId
          action: 'update existing issue',
          item: CreateItemByExistingIssue(item, res, attach),
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const CreateItemByExistingIssue = (item, res, attach) => {
    return {
      id: item.issue_id,
      title: item.issue_title,
      type: item.issue_type,
      violation_type: item.issue_title,
      image: {
        uri: res.data,
        height: parseInt(item.issue_image_height, 10),
        width: parseInt(item.issue_image_width, 10),
      },
      caption: item.issue_caption,
      status: item.issue_status,
      tracking: item.tracking_or_not,
      location: item.issue_location,
      activity: item.issue_task,
      assignee: item.issue_recorder,
      assignee_phone_number: '',
      responsible_corporation: item.issue_manufacturer,
      safetyManager: item.issue_recorder,
      attachments: [attach],
      labels: [],
      timestamp: new Date().toLocaleString(),
    };
  };

  // @處理將照片送出並辨識動作, 並觸發CreateItemByImage, 導入IssueScreen
  // action為"create new issue"
  const detectAndSwitchToIssueScreen = async imagee => {
    console.log('Send image detect request');
    setIsDedecting(true);
    var bodyFormData = new FormData();
    let image = imagee;
    image.uri = 'file://' + image.uri.replace('file://', '');
    bodyFormData.append('file', {
      uri: image.uri,
      name: image.fileName,
      type: 'image/jpg',
    });
    axios({
      method: 'post',
      url: 'http://34.80.209.101:8000/predict',
      data: bodyFormData,
      headers: {'Content-Type': 'multipart/form-data'},
      timeout: 20000,
    })
      .then(async function (response) {
        //handle success
        //console.log(response.data);
        setIsDedecting(false);
        console.log(response.data);
        navigation.navigate('Issue', {
          project: project,
          action: 'create new issue',
          violation_type: response.data.violation_type,
          issue_type: response.data.issue_type,
          caption: response.data.caption,
          item: CreateItemByImage(image),
        });
      })
      .catch(e => {
        //handle error
        setIsDedecting(false);
        Alert.alert('辨識失敗');
        navigation.navigate('Issue', {
          project: project,
          action: 'create new issue',
          violation_type: '',
          issue_type: '',
          caption: '',
          item: CreateItemByImage(image),
        });
        console.log(e);
      });
  };

  // @!選取照片, 並觸發detectAndSwitchToIssueScreen(image)
  const imageSelectHandler = () => {
    showActionSheetWithOptions(
      {
        options: ['拍照', '從相簿選取照片', '取消'],
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: 2,
        // userInterfaceStyle: 'light', //'dark'
      },
      selectedIndex => {
        console.log(selectedIndex)
        switch (selectedIndex) {
          case 0:
            launchCamera(
              {quality: 0.1, mediaType: 'photo', saveToPhotos: true},
              res => {
                //includeBase64: true --> return base64Image
                if (res.errorMessage !== undefined) {
                  console.error(`code: ${res.errorCode}: ${res.erroMessage}`);
                  return;
                }

                if (!res.didCancel) {
                  const image = res.assets[0];
                  detectAndSwitchToIssueScreen(image);
                }
              },
            );
            break;
          case 1:
            launchImageLibrary({quality: 0.1, mediaType: 'photo'}, res => {
              if (res.errorMessage !== undefined) {
                console.error(`code: ${res.errorCode}: ${res.erroMessage}`);
                return;
              }

              if (!res.didCancel) {
                const image = res.assets[0];
                detectAndSwitchToIssueScreen(image);
              }
            });
            break;
          case 2: // cancel action
            break;
        }
      },
    );
  };

  // 向後端請求此project的issues list
  // **************************************** //
  useEffect(() => {
    const fetchIssues = async () => {
      await axios
        .get(`${BASE_URL}/issues/list/${project.project_id}`)
        .then(async (res) => {
          let issues = await res.data;
          sortIssues = issues.sort(               //按照時間將issues排序
            (a, b) => new Date(b.create_at) - new Date(a.create_at)
          )
          setIssueList(sortIssues);
          selectedEndDate? setFilterIssueList(issuesFilter(sortIssues)) : setFilterIssueList('');
        })
        .catch((e) => {
          console.log(`List issues error: ${e}`);
        });
    };
    // const deleteTmpFiles = () => {
    //   try {
    //     RNFetchBlob.fs.unlink(RNFetchBlob.fs.dirs.DocumentDir + "/RNFetchBlob_tmp/")
    //   }
    //   catch (e){
    //     console.log('failed to delete tmp files', e);
    //   }
    // }

    if (selectedSearch.length === 0) {
      fetchIssues();
    }

    // if (isFocused) {
    //   deleteTmpFiles();
    // }
  }, [isFocused, project.project_id, selectedSearch, selectedEndDate]);
  // **************************************** //

  // 篩選issues
  // **************************************** //
  useEffect(() => {
    const toFilterIssues = async () => {
      var filteredIssue = []
      try {
        selectedSearch.map((key)=>{
          switch (key) {
            // 是否已改善
            case '2':
              return;
            case '3':
              return;
            // 有沒有辦法在外面就得知issue有沒有改善？
            // filteredIssueList ?
            //   filteredIssueList.map((issue) => {
            //     if issue
            //   })

            //風險評級
            case '5':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_status == 0)))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_status == 0))
              }
              return;
            case '6':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_status == 1)))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_status == 1))
              }
              return;
            case '7':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_status == 2)))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_status == 2))
              }
              return;

            //缺失項目
            case '9':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_title == '墜落')))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_title == '墜落'))
              }
              return;
            case '10':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_title == '機械')))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_title == '機械'))
              }
              return;
            case '11':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_title == '物料')))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_title == '物料'))
              }
              return;
            case '12':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_title == '感電')))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_title == '感電'))
              }
              return;
            case '13':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_title == '防護具')))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_title == '防護具'))
              }
              return;
            case '14':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_title == '穿刺')))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_title == '穿刺'))
              }
              return;
            case '15':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_title == '爆炸')))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_title == '爆炸'))
              }
              return;
            case '16':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_title == '工作場所')))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_title == '工作場所'))
              }
              return;
            case '17':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_title == '搬運')))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_title == '搬運'))
              }
              return;
            case '18':
              if (selectedEndDate){
                filteredIssue.push(...issuesFilter(issueList.filter((issue)=>issue.issue_title == '其他')))
              } else {
                filteredIssue.push(...issueList.filter((issue)=>issue.issue_title == '其他'))
              }
              return;
          }
        });
      }
      catch (e){
        console.log(e);
      }
      finally {
        setFilterIssueList(filteredIssue.filter((issue, index)=> filteredIssue.indexOf(issue) === index));
      }
    };
    if (selectedSearch.length !== 0){
      toFilterIssues();
    }
    console.log('sort', ...improvement_option.map((item)=> {
      if (!selectedSearch.some(a => a === '2' || a === '3')){
        return item;
      }
      // else{
      //   return selectedSearch[selectedSearch.findIndex(b => b === item.key)]
      // }
    }))

  }, [selectedSearch, selectedEndDate]);
  // **************************************** //

  // 頂端列按鈕行為: 時間排序/依日期篩選/匯出缺失記錄表
  React.useLayoutEffect(() => {
    navigation.setOptions(
      userInfo.user.permission != '訪客' ?
      {
        headerRight: () => (
          <React.Fragment>
            <SortButton 
              selectedEndDate={selectedEndDate}
              filteredIssueList={filteredIssueList}
              setFilterIssueList={setFilterIssueList}
              issueList={issueList}
              setIssueList={setIssueList}
            />
            <FilterButton 
            setSelectedStartDate={setSelectedStartDate}
            setSelectedEndDate={setSelectedEndDate}
            navigation={navigation}
            />
            <ExportButton 
              base_url={BASE_URL}
              project={project}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              filteredIssueList={filteredIssueList}
              issueList={issueList}
              setIsExporting={setIsExporting} 
            />
          </React.Fragment>
        )
      }
      :
      {}
    );
  }, [navigation, issueList, filteredIssueList]);

  // 右滑刪除動作, 實作在Swipeout元件中
  const swipeBtns = [
    userInfo.user.permission != '訪客' ?
    {
      text: <Ionicons name={'ios-trash'} size={24} color={'white'} />,
      backgroundColor: 'red',
      underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
      onPress: () => issueDeleteHandler(),
    }
    :
    {},
  ];

  // 在detectAndSwitchToIssueScreen中觸發
  const CreateItemByImage = (image) => {
    image.uri = image.uri.replace('file://', '');

    return {
      id: '',
      title: '',
      type: '',
      violation_type: '',
      caption: '',
      image,
      status: ISSUE_STATUS.mediumRisk.id,
      tracking: true,
      location: '',
      activity: '',
      assignee: '',
      assignee_phone_number: '',
      responsible_corporation: '',
      safetyManager: project.inspector,
      attachments: [],
      labels: [],
      timestamp: new Date().toLocaleString(),
    };
  };

  // 搜尋欄的選項
  const improvement_option = [
    {key:'1', value:'已改善', disabled:true},
    {key:'2', value:'是'},
    {key:'3', value:'否'},
  ];
  const status_option = [
    {key:'4', value:'風險狀態', disabled:true},
    {key:'5', value:'無風險'},
    {key:'6', value:'有風險，須改善'},
    {key:'7', value:'有風險，須立即改善'},
  ];
  const violationType_option = [
    {key:'8', value:'缺失類別', disabled:true},
    {key:'9', value:'墜落'},
    {key:'10', value:'機械'},
    {key:'11', value:'物料'},
    {key:'12', value:'感電'},
    {key:'13', value:'防護具'},
    {key:'14', value:'穿刺'},
    {key:'15', value:'爆炸'},
    {key:'16', value:'工作場所'},
    {key:'17', value:'搬運'},
    {key:'18', value:'其他'},
  ];

  // List中各單獨元件
  const Item = ({item, onPress, backgroundColor, textColor}) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
      <View style={styles.panelLeftContainer}>
        {/* <Image
          style={styles.image}
          source={{uri: item.image.uri.replace('file://', '')}}
        /> */}
        <FastImage
          style={styles.image}
          source={{
            uri: `${BASE_URL}/issues/get/thumbnail/${item.issue_id}`,
          }}
        />
        {item.tracking ? (
          <Badge
            status="primary"
            containerStyle={styles.badge}
            value={item.attachments.length}
          />
        ) : undefined}
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
            {item.create_at}
          </Text>
        </View>
        <Text style={[styles.descriptionText, textColor]}>
          {/* {item.violation_type === '其他'
            ? `[${item.violation_type}]\n${item.type_remark}`
            : item.violation_type !== ''
            ? `(${item.violation_type})\n${item.title}`
            : ''} */}
            {item.issue_title}{`\n`}{item.issue_type}
        </Text>
        <View style={styles.objLabelAreaContainer}>
          {Array.isArray(item.labels) ? (
            item.labels.map((label, i) => {
              return (
                <View key={`item_object_${i}`} style={styles.objLabelContainer}>
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
  );

  const renderItem = ({item}) => {
    const backgroundColor = item.id === selectedIssueId ? 'white' : 'white'; //"#6e3b6e" : "#f9c2ff";
    const color = item.id === selectedIssueId ? 'black' : 'black'; //'white' : 'black';

    return (
      <React.Fragment>
        <Swipeout
          key={item.issue_id}
          right={swipeBtns}
          onOpen={() => setSelectedIssueId(item.issue_id)}>
          <Item
            key={`${item.issue_id}`}
            item={item}
            onPress={() => userInfo.user.permission != '訪客'? issueSelectHandler(item) : {}}
            backgroundColor={{backgroundColor}}
            textColor={{color}}
          />
        </Swipeout>
        <Separator key={`seperator_${item.issue_id}`} />
      </React.Fragment>
    );
  };

  return(
    // 缺失表單生成中 或 缺失類別辨識中, 顯示loading畫面
    <React.Fragment>
      {isExporting &&
        <SafeAreaView style={styles.container}>
          <View style={styles.loading_container}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={[styles.loading_text]}>缺失表單生成中...</Text>
          </View>
        </SafeAreaView>
      } 
      {isDedecting &&
        <SafeAreaView style={styles.container}>
          <View style={styles.loading_container}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={[styles.loading_text]}>缺失類別辨識中...</Text>
          </View>
        </SafeAreaView>
      }
      {!isExporting && !isDedecting &&
        // 正常顯示issueList情況
        <SafeAreaView style={styles.container}>
          {/* <View style={{paddingHorizontal:5, backgroundColor:'white'}}>
            <MultipleSelectList 
            setSelected={(val) => {setSelectedSearch(val)}}
            data={[
                // improvement_option.map((item)=> {
                //   if(!selectedSearch.some(a => a === '2' || a === '3')){
                //     return item
                //   }
                //   else{
                //     return selectedSearch[selectedSearch.findIndex(b => b === item.key)]
                //   }
                // }).concat(
                //   status_option.map((item)=> {
                //     if(!selectedSearch.some(a => a === '5' || a === '6' || a === '7')){
                //       return item
                //     }
                //     else{
                //       return selectedSearch[selectedSearch.findIndex(b => b === item.key)]
                //     }
                //   })
                // ).concat(
                //   violationType_option.map((item)=> {
                //     if(!selectedSearch.some(a => a === '5' || a === '6' || a === '7')){
                //       return item
                //     }
                //     else{
                //       return selectedSearch[selectedSearch.findIndex(b => b === item.key)]
                //     }
                //   })
                // )

              ...improvement_option,
              ...status_option,
              ...violationType_option,
            ]}
            search={false}
            save="key"
            label="已選擇："
            placeholder='點撃選擇欲顯示缺失之條件'
            searchPlaceholder='請輸入關鍵字'
            notFoundText='找不到'
            arrowicon={<Icon name="chevron-down" type={'font-awesome'} size={12} color={'black'} />} 
            searchicon={<Icon name="search" type={'font-awesome'} size={12} color={'black'} />}
            closeicon={<Icon name="check" type={'font-awesome'} size={20} color={'black'} />}
            boxStyles={{borderColor: '#ccc'}}
            inputStyles={{marginLeft:10, placeholderTextColor:'#aaa', fontSize:16}}
            dropdownStyles={{marginBottom:10}}
            dropdownItemStyles={{paddingVertical:15}}
            dropdownTextStyles={{fontSize:18}}
            disabledItemStyles={{paddingVertical:15}}
            disabledTextStyles={{fontSize:18, color:'#999'}}
            checkBoxStyles={{width:20, height:20}}
            disabledCheckBoxStyles={{width:0, height:0}}
            badgeStyles={{backgroundColor:'#fff', borderWidth:1, borderColor:'#ccc'}}
            badgeTextStyles={{fontSize:14, color:'dodgerblue'}}
            labelStyles={{fontSize:18, color:'#333'}}
            />
          </View> */}
          <FlatList
            ListHeaderComponent={<Separator />}
            data={selectedEndDate || filteredIssueList.length!==0 ? filteredIssueList : issueList}
            // data={issueList}
            renderItem={renderItem}
            keyExtractor={item => item.issue_id}
            extraData={selectedIssueId}
          />
          {userInfo.user.permission != '訪客' &&
            <View style={styles.addPhotoBtn}>
              <Icon
                raised
                name="ios-add"
                type="ionicon"
                color="dodgerblue"
                size={32}
                iconStyle={{fontSize: 52, marginLeft: 4}}
                onPress={() => imageSelectHandler()}
              />
            </View>
          }
          
        </SafeAreaView>
      }
    </React.Fragment>)
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: StatusBar.currentHeight || 0,
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
    shadowOffset: {width: 3, height: 8},
  },
  loading_container: {
    position: 'absolute',
    alignItems: 'center',
    alignSelf: 'center',
    display: 'flex',
    marginTop: 300,
  },
  loading_text: {
    fontSize: 32,
    color: 'white',
    backgroundColor: 'gray',
  }
});

export default IssueListScreen;
