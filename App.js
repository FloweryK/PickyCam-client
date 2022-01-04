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

const App = () => {
  const devices = useCameraDevices();
  const device = devices.back;

  const [image, setImage] = useState("");

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";

    const result = sampleFrame(frame);
    const encoded = result.data;

    runOnJS(setImage)(encoded);
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
          frameProcessorFps={0.5}
        />
        <Image
          style={styles.camera}
          source={{ uri: `data:image/jpeg;base64,${image}` }}
        />
        <Text>{image.length}</Text>
        <Text>{image.slice(0, 30)}</Text>
        <Text>{image.slice(image.length - 30, image.length)}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  camera: {
    width: 150,
    height: 200,
  },
});

export default App;
