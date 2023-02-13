import React, { useEffect, useState } from 'react';
// import type {Node} from 'react';
import {
  ActionSheetIOS,
  Alert,
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  // Image,
  // ImageBackground,
  // SafeAreaView,
  // ScrollView,
  // StatusBar,
  // useColorScheme,
} from 'react-native';
// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';
// import { Icon } from 'react-native-elements';
// import Draggable from 'react-native-draggable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Orientation from 'react-native-orientation';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import { BlurView } from 'react-native-blur';
import { OBJECT_TYPE } from '../../configs/objectTypeConfig';
import SqliteManager from '../../services/SqliteManager';
import axios from 'axios';
import { BASE_URL } from '../../configs/authConfig';

const STROKE_WIDTH = 20;
const DETECTION_THRESHOLD = 0.7;

const PhotoScreen = ({ navigation, route }) => {
  console.log('/// Pass to PhotoScreen ///');
  console.log(route.params);
  const issueId = route.params.issueId;
  const setIssueLabels = route.params.setIssueLabels;

  const [canvas, setCanvas] = useState(undefined);
  const [canvasContainerStyle, setCanvasContainerStyle] = useState(undefined);
  const [canvasTouchEnable, setCanvasTouchEnable] = useState(false);
  const [currentLabelOption, setCurrentLabelOption] = useState();
  const [currentLabelMode, setCurrentLabelMode] = useState(); //'box', 'brush'
  const [boxObjects, setBoxObjects] = useState(route.params.issueLabels);
  const [isImageDetect, setIsImageDetect] = useState(false);

  const labelOptions = OBJECT_TYPE.map(o => o.name);
  labelOptions.push('取消');

  React.useLayoutEffect(() => {
    navigation.setOptions({ // 按辨識
      headerRight: () => (
        <React.Fragment>
          <Button title="辨識" disabled={isImageDetect} onPress={imageDetect} />
          <Button
            title="完成"
            onPress={() => {
              navigation.goBack();
            }}
          />
        </React.Fragment>
      ),
    });
  }, [boxObjects, isImageDetect, navigation]);

  const imageDetect = async () => {
    console.log('Send image detect request');
    setIsImageDetect(true);

    // axios.get('http://54.191.231.100:5000/ping')
    // .then(function (response) {
    //   // handle success
    //   console.log(response.data);
    // })
    // .catch(function (error) {
    //   // handle error
    //   console.log(error);
    // })
    // .then(function () {
    //   // always executed
    // });

    /* label schema in app */
    // [{"box": {"maxX": 259, "maxY": 395.5, "minX": 82, "minY": 193.5}
    // , "key": "d6ed5392-03ac-48a4-96de-dbddeb2b4a68"
    // , "mode": "box"
    // , "name": "防墜網"
    // , "path": {"drawer": null, "path": [Object], "size": [Object]}}]

    /* label schema from object detection */
    // box: [top_left_x, top_left_y, bottom_right_x, bottom_right_y]
    //{"boxes": [[1760, 0, 4032, 3024]], "labels": ["excavator"]}
    var bodyFormData = new FormData();
    let image = route.params.image;
    const windowWidth = Dimensions.get('window').width;
    const imageScaleRatio = windowWidth / image.width;
    image.uri = 'file://' + image.uri.replace('file://', '');
    bodyFormData.append('file', {
      uri: image.uri,
      name: image.fileName,
      type: 'image/jpg',
    });
    let labels = boxObjects;
    axios({
      method: 'post',
      url: 'http://34.80.209.101:8000/predict',
      data: bodyFormData,
      headers: {'Content-Type': 'multipart/form-data'},
    })
      .then(async function (response) {
        //handle success
        //console.log(response.data);
        let predictions = response.data;
        for (let i = 0; i < predictions.labels.length; ++i) {
          let name = predictions.labels[i];
          let box = predictions.boxes[i];
          let score = predictions.scores[i];
          let violation_type = predictions.violation_type;
          console.log(box);
          console.log(name);
          console.log(score);
          console.log(violation_type);
          if (score >= DETECTION_THRESHOLD) {
            let label = {
              box: {
                maxX: box[2] * imageScaleRatio,
                maxY: box[3] * imageScaleRatio,
                minX: box[0] * imageScaleRatio,
                minY: box[1] * imageScaleRatio,
              },
              mode: 'box',
              name: name,
              type: violation_type,
              path: {drawer: null, path: null, size: null},
            };
            const newBoxObj = await labelAddHandler(
              label.box,
              label.name,
              label.mode,
              label.path,
              label.type,
            );
            labels.push(newBoxObj);
          }
        }
        setBoxObjects(labels);
        setIssueLabels(labels);
        setIsImageDetect(false);
      })
      .catch(function (response) {
        //handle error
        setIsImageDetect(false);
        console.log(response);
      });
  };

  useEffect(() => {
    Orientation.lockToPortrait();
    const image = route.params.image;
    const windowSize = Dimensions.get('window');
    const canvasHeight = (image.height * windowSize.width) / image.width;
    if (canvasHeight) {
      const style = {height: canvasHeight, width: windowSize.width};
      setCanvasContainerStyle(style);
    }
  }, [route.params.image]);

  const boxIconClickHandler = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: labelOptions,
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: OBJECT_TYPE.length,
        userInterfaceStyle: 'light', //'dark'
      },
      buttonIndex => {
        if (buttonIndex === labelOptions.length) {
          // cancel action
        } else {
          setCurrentLabelOption(OBJECT_TYPE[buttonIndex]);
          setCanvasTouchEnable(true);
          setCurrentLabelMode('box');
        }
      },
    );
  };

  const brushIconClickHandler = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: labelOptions,
        // destructiveButtonIndex: [1,2],
        cancelButtonIndex: OBJECT_TYPE.length,
        userInterfaceStyle: 'light', //'dark'
      },
      buttonIndex => {
        if (buttonIndex === labelOptions.length) {
          // cancel action
        } else {
          setCurrentLabelOption(OBJECT_TYPE[buttonIndex]);
          setCanvasTouchEnable(true);
          setCurrentLabelMode('brush');
        }
      },
    );
  };

  const labelAddHandler = async (box, name, mode, path) => {
    const newLabel = {
      max_x: box.maxX,
      max_y: box.maxY,
      min_x: box.minX,
      min_y: box.minY,
      issue_id: issueId,
      name: name,
      mode: mode,
      path: path,
    };
    console.log('new label');
    console.log(newLabel);

    // 存入資料庫
    axios
      .post(`${BASE_URL}/labels/add/${issueId}`, {
        newLabel,
      })
      .then(async (res) => {
        console.log(res.data);
      })
      .catch((e) => {
        console.log(`label add error: ${e}`);
      });

    await SqliteManager.createIssueLabel(newLabel);

    const allLabels = await SqliteManager.getIssueLabelsByIssueId(issueId);
    const sortedLabels = allLabels.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    const latestLabels = sortedLabels[0];

    return {
      key: latestLabels.id,
      name: name,
      box: box,
      mode: mode,
      path: path,
    };
  };

  const labelDeleteHandler = async labelId => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['取消', '刪除'],
        destructiveButtonIndex: [1],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light', //'dark'
      },
      async buttonIndex => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1) {
          canvas.clear();
          // 刪除選取的box
          const newBoxObjs = boxObjects.filter(b => b.key !== labelId);
          await SqliteManager.deleteIssueLabel(labelId);
          setBoxObjects(newBoxObjs);
          setIssueLabels(newBoxObjs);
        }
      },
    );
  };

  const CreateBox = boxObject => {
    const { key, name, box, path, mode } = boxObject;
    if (canvas && mode === 'brush') {
      canvas.addPath(path);
    }
    return (
      <TouchableOpacity
        key={key}
        style={{
          position: 'absolute',
          left: box.minX,
          top: box.minY,
          width: box.maxX - box.minX,
          height: box.maxY - box.minY,
          borderWidth: 2,
          borderColor: 'green',
          zIndex: 9999,
          backgroundColor: '#FFFFFF40',
        }}
        onPress={() => labelDeleteHandler(key)}>
        <Text> {name} </Text>
      </TouchableOpacity>
    );
  };

  return (
    <React.Fragment>
      {boxObjects.map(boxObject => CreateBox(boxObject))}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {canvasContainerStyle ? (
          <SketchCanvas
            ref={ref => setCanvas(ref)}
            localSourceImage={{
              filename: route.params.image.uri.replace('file://', ''),
              directory: null,
              mode: 'AspectFit',
            }}
            style={{ flex: 1, ...canvasContainerStyle }}
            strokeColor={'#FF000040'}
            strokeWidth={STROKE_WIDTH}
            touchEnabled={canvasTouchEnable}
            onStrokeStart={(x, y) => {
              console.log('x: ', x, ', y: ', y);
              console.log(' Stroke Start');
            }}
            onStrokeChanged={(x, y) => {
              console.log('x: ', x, ', y: ', y);
              console.log(' Stroke Changed');
            }}
            onStrokeEnd={async path => {
              try {
                console.log(' Stroke End');
                console.log(path);
                const box = GetBoundingBoxByPath(path, canvasContainerStyle);
                const newBoxObj = await labelAddHandler(
                  box,
                  currentLabelOption.name,
                  currentLabelMode,
                  path
                );

                setBoxObjects(boxObjects.concat([newBoxObj]));
                setIssueLabels(boxObjects.concat([newBoxObj]));
                setCanvasTouchEnable(false);
                setCurrentLabelOption(undefined);
                setCurrentLabelMode(undefined);
                //canvas.deletePath(path.path.id);
                currentLabelMode != 'brush'
                  ? canvas.deletePath(path.path.id)
                  : undefined;
              } catch (error) {
                console.log(error);
              }
            }}
          />
        ) : undefined}
      </View>
      <View style={{ flexDirection: 'row' }}>
        <BlurView
          style={styles.labelToolButton}
          blurType="light"
          blurAmount={20}>
          <TouchableOpacity onPress={() => boxIconClickHandler()}>
            <Ionicons style={styles.icon} name={'ios-square-outline'} />
          </TouchableOpacity>
        </BlurView>
        <BlurView
          style={styles.labelToolButton}
          blurType="light"
          blurAmount={20}>
          <TouchableOpacity onPress={() => brushIconClickHandler()}>
            <Ionicons style={styles.icon} name={'ios-brush'} />
          </TouchableOpacity>
        </BlurView>
        {
          boxObjects.length == 0 ? (
            <BlurView
              style={styles.textContainer}
              blurType="light"
              blurAmount={20}>
              <Text style={styles.text}>{"←請先選取物件類別"}</Text>
            </BlurView>
          ) : undefined
        }
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  labelToolButton: {
    borderRadius: 30,
    marginLeft: 10,
    marginBottom: 5,
  },
  icon: {
    fontSize: 32,
    color: 'goldenrod',
    marginHorizontal: 15,
    marginVertical: 15,
  },
  textContainer: {
    borderRadius: 10,
    marginRight: 5,
    marginLeft: "auto",
  },
  text: {
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
});

// //Sample of path object form react-native-sketch-canvas
// {
//     drawer: 'user1',
//     size: { // the size of drawer's canvas
//       width: 480,
//       height: 640
//     },
//     path: {
//       id: 8979841, // path id
//       color: '#FF000000', // ARGB or RGB
//       width: 5,
//       data: [
//         "296.11,281.34",  // x,y
//         "293.52,284.64",
//         "290.75,289.73"
//       ]
//     }
//   }
const GetBoundingBoxByPath = (pathObj, canvasStyle) => {
  let box = {
    minX: undefined,
    minY: undefined,
    maxX: undefined,
    maxY: undefined,
  };
  if (pathObj.path) {
    if (Array.isArray(pathObj.path.data)) {
      let xs = [];
      let ys = [];
      pathObj.path.data.map(xyString => {
        xs.push(parseFloat(xyString.split(',')[0].trim()));
        ys.push(parseFloat(xyString.split(',')[1].trim()));
      });
      for (let i = 0; i < xs.length; ++i) {
        if (!box.minX || xs[i] < box.minX) {
          box.minX = xs[i];
        }
        if (!box.maxX || xs[i] > box.maxX) {
          box.maxX = xs[i];
        }
        if (!box.minY || ys[i] < box.minY) {
          box.minY = ys[i];
        }
        if (!box.maxY || ys[i] > box.maxY) {
          box.maxY = ys[i];
        }
      }
    }
  }

  //Let box inside the canvas
  box.minX = box.minX < 0 ? 0 : box.minX - 10;
  box.minY = box.minY < 0 ? 0 : box.minY - 10;
  box.maxX = box.maxX > canvasStyle.width ? canvasStyle.width : box.maxX + 10;
  box.maxY = box.maxY > canvasStyle.height ? canvasStyle.height : box.maxY + 10;

  return box;
};

export default PhotoScreen;
