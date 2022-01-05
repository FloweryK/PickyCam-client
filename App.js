import "react-native-reanimated";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from "react-native-vision-camera";
import { sampleFrame } from "./sampleFrame";
import { runOnJS } from "react-native-reanimated";
import FastImage from "react-native-fast-image";

const App = () => {
  const devices = useCameraDevices();
  const device = devices.back;

  const [image, setImage] = useState("");
  const [format, setFormat] = useState("");

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";

    const result = sampleFrame(frame);

    runOnJS(setImage)(result.encoded);
    runOnJS(setFormat)(result.format);
  }, []);

  // render
  if (device == null) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <View>
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
        <FastImage
          style={styles.image}
          source={{ uri: `data:image/jpeg;base64,${image}` }}
        />
        <Text>Image length: {image.length}</Text>
        <Text>Image format: {format}</Text>
        <Text>Image[:30]: {image.slice(0, 30)}</Text>
        <Text>Image[-30:]: {image.slice(image.length - 30, image.length)}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  camera: {
    width: 150,
    height: 200,
  },
  image: {
    width: 150,
    height: 200,
  },
});

export default App;
