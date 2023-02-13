import React, {useEffect, useState, useRef} from 'react';
// import type {Node} from 'react';
import {
  ActionSheetIOS,
  Alert,
  Button,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Text,
  TouchableOpacity,
  Dimensions,
  View,
} from 'react-native';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Icon} from 'react-native-elements';
import Draggable from 'react-native-draggable';
import {BlurView} from 'react-native-blur';
import {LABEL_OPTIONS} from '../../configs/labelConfig';
import Orientation from 'react-native-orientation';
import {SketchCanvas} from '@terrylinla/react-native-sketch-canvas';
import { BASE_URL } from '../configs/authConfig';

// const BOX_OBJS = [
//   {
//     key: 1647242310981,
//     name: '施工架',
//     box: {
//       minX: 47.5,
//       minY: 150,
//       maxX: 162.5,
//       maxY: 369.5,
//     },
//     path: {
//       path: {
//         id: 75003699,
//         color: '#FF000040',
//         width: 20,
//         data: [
//           '140,168',
//           '145,176',
//           '150,186.5',
//           '155,199',
//           '158.5,211',
//           '161,223',
//           '162,235',
//           '162.5,245',
//           '162.5,254.5',
//           '161.5,263',
//           '158,271.5',
//           '152.5,282.5',
//           '146.5,294.5',
//           '139,309.5',
//           '133,321.5',
//           '125.5,334.5',
//           '117.5,345.5',
//           '109.5,354',
//           '100,361.5',
//           '92,365.5',
//           '82.5,368.5',
//           '74,369.5',
//           '67.5,369.5',
//           '61,369.5',
//           '55.5,363',
//           '51.5,351',
//           '49,338.5',
//           '47.5,325.5',
//           '47.5,312.5',
//           '47.5,298.5',
//           '48,283',
//           '50,266',
//           '52,249.5',
//           '54,231.5',
//           '56,214.5',
//           '57.5,202',
//           '60,192',
//           '61.5,183.5',
//           '63.5,174.5',
//           '70,160.5',
//           '75.5,154',
//           '82,151',
//           '87,150',
//           '93.5,150',
//           '101.5,150',
//           '111,152.5',
//           '118.5,156',
//           '127,161',
//           '132.5,165.5',
//           '138.5,170.5',
//         ],
//       },
//       size: {
//         width: 375,
//         height: 666.5,
//       },
//       drawer: null,
//     },
//     mode: 'brush',
//   },
// ];

const PhotoLabelViewer = ({image, labels, item}) => {
  const issueId = item.issue_id;
  const [canvasContainerStyle, setCanvasContainerStyle] = useState(undefined);
  const [canvas, setCanvas] = useState(undefined);

  useEffect(() => {
    Orientation.lockToPortrait();
    const windowSize = Dimensions.get('window');
    const canvasHeight = (image.height * windowSize.width) / image.width;
    if (canvasHeight) {
      const style = {height: canvasHeight, width: windowSize.width};
      setCanvasContainerStyle(style);
    }
  }, [image]);

  const CreateBox = boxObject => {
    const {key, name, box, path, mode} = boxObject;
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
        >
        <Text> {name} </Text>
      </TouchableOpacity>
    );
  };

  return (
    <React.Fragment>
      <View style={{flex: 1, flexDirection: 'row'}}>
        {canvasContainerStyle ? (
          <SketchCanvas
            ref={ref => setCanvas(ref)}
            localSourceImage={{
              filename: image.uri.replace('file://', ''),
              // filename: `${BASE_URL}/issues/get/thumbnail/${issueId}`,
              directory: null,
              mode: 'AspectFit',
            }}
            style={{flex: 1, ...canvasContainerStyle}}
            strokeColor={'#FF000040'}
            strokeWidth={20}
            touchEnabled={false}
          />
        ) : undefined}
      </View>
      {canvas ? labels.map(b => CreateBox(b)) : undefined}
    </React.Fragment>
  );
};

export default PhotoLabelViewer;
