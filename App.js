import "react-native-reanimated";
import React, { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
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
  // DEV USAGE
  const [addr, setAddr] = useState("http://192.168.25.61:8080");

  // PRODUCTION USAGE
  const [cameraType, setCameraType] = useState("front");
  const [image, setImage] = useState("");
  const [uri, setUri] = useState("");

  const [isConnected, setIsConnected] = useState(false);

  const socket = useRef(null);

  const devices = useCameraDevices();
  const device = cameraType == "front" ? devices.front : devices.back;

  const frameProcessor = useFrameProcessor((data) => {
    "worklet";
    const result = sampleFrame(data);
    runOnJS(setImage)(result.encoded);
  }, []);

  const toggleCameraType = () => {
    setCameraType(cameraType == "front" ? "back" : "front");
  };

  useEffect(() => {
    socket.current = io(`http://${addr}`);

    socket.current.on("connect", () => {
      console.log("connected");
      setIsConnected(true);
    });

    socket.current.on("disconnect", () => {
      console.log("disconnected");
      setIsConnected(false);
    });

    socket.current.on("response", (data) => {
      console.log("received");

      const json = JSON.parse(data);
      const frame = json.frame;

      if (frame.length > 0) {
        setUri(`data:image/jpeg;base64,${frame.slice(2, frame.length - 1)}`);
      } else {
        setUri(`data:image/jpeg;base64,${image}`);
      }
    });
  }, [addr]);

  // emit event
  useEffect(async () => {
    if (isConnected) {
      console.log("request sent");
      socket.current.emit("request", { frame: image });
    } else {
      console.log("request not sent");
      setUri(`data:image/jpeg;base64,${image}`);
    }
  }, [image]);

  if (device == null) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Button title="toggle camera" onPress={toggleCameraType} />
      <TextInput
        placeholder="Host address"
        onSubmitEditing={(event) => setAddr(event.nativeEvent.text)}
      />
      <Camera
        // style={{ width: 300, height: 400 }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={1}
      />
      <FastImage style={{ width: 300, height: 400 }} source={{ uri }} />
    </View>
  );
};

export default App;
