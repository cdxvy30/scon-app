import React, { useEffect, useState, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Orientation from 'react-native-orientation';
import SketchCanvas from '@terrylinla/react-native-sketch-canvas';
import { BASE_URL } from '../../configs/authConfig';

const RemoteImageWithSketch = ({ image, labels, item }) => {
  console.log('/// Params in RemoteImageWitSketch ///');
  console.log(item);
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

  const CreateBox = (boxObject) => {
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
      <View style={{ flex: 1 }}>
        <Image
          style={{ flex: 1 }}
          source={{ uri: `${BASE_URL}/issues/get/thumbnail/${issueId}` }}
          resizeMode="contain"
        />
        <SketchCanvas
          ref={ref => setCanvas(ref)}
          style={{ flex: 1, ...canvasContainerStyle }}
          strokeColor="#FF0000"
          strokeWidth={20}
          touchEnabled={false}
        />
      </View>
      {canvas ? labels.map(b => CreateBox(b)) : undefined}
    </React.Fragment>
  );
};

export default RemoteImageWithSketch;
