import "react-native-reanimated";
import React, { useEffect, useRef, useState } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from "react-native-vision-camera";
import { sampleFrame } from "./sampleFrame";
import { runOnJS } from "react-native-reanimated";
import FastImage from "react-native-fast-image";
import { io } from "socket.io-client";

const App = () => {
  const [cameraType, setCameraType] = useState("front");
  const [image, setImage] = useState("");
  const [uri, setUri] = useState("");

  const devices = useCameraDevices();
  const device = cameraType == "front" ? devices.front : devices.back;

  const socket = useRef(null);

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";

    const result = sampleFrame(frame);

    runOnJS(setImage)(result.encoded);
  }, []);

  const toggleCameraType = () => {
    setCameraType(cameraType == "front" ? "back" : "front");
  };

  useEffect(() => {
    socket.current = io("http://10.0.2.2:8080");

    socket.current.on("connect", () => {
      console.log("connected");
    });

    socket.current.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.current.on("response", (data) => {
      console.log("received");
      const frame = JSON.parse(data).frame;

      if (typeof frame !== "undefined") {
        console.log("frame exists");
        setUri(`data:image/jpeg;base64,${frame.slice(2, frame.length - 1)}`);
      } else {
        console.log("frame does not exists");
        setUri(`data:image/jpeg;base64,${image}`);
      }
    });
  }, []);

  // emit event
  useEffect(() => {
    console.log("sent");

    socket.current.emit("request", { frame: image });
  }, [image]);

  if (device == null) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Button title="toggle camera" onPress={toggleCameraType} />
      <Camera
        style={{ width: 300, height: 400 }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={1}
      />
      <FastImage style={{ width: 300, height: 400 }} source={{ uri }} />
    </View>
  );
};

const styles = StyleSheet.create({});

export default App;
