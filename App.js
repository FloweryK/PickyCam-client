import "react-native-reanimated";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
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
  const devices = useCameraDevices();
  const device = devices.back;

  const [image, setImage] = useState("");
  const [format, setFormat] = useState("");
  const [uri, setUri] = useState("");

  const socket = useRef(null);

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";

    const result = sampleFrame(frame);

    runOnJS(setImage)(result.encoded);
    runOnJS(setFormat)(result.format);
  }, []);

  useEffect(() => {
    // socket.io-client
    // socket.current = io("http://10.0.2.2:8080");
    socket.current = io("http://192.168.25.61:8080");

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

  // render
  if (device == null) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.image}>
        <Camera
          // style={styles.camera}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={1}
        />
        <FastImage style={styles.image} source={{ uri }} />
        {/* <Text>
          Sent: {image.length} ({format}) {"\n"}
          {image.slice(0, 30)}...{image.slice(image.length - 30, image.length)}
        </Text>
        <Text>
          Sent: {uri.length} ({format}) {"\n"}
          {uri.slice(0, 30)}...
          {uri.slice(uri.length - 30, uri.length)}
        </Text> */}
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
    ...StyleSheet.absoluteFill,
    // width: 150,
    // height: 200,
  },
});

export default App;
