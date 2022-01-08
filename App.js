import "react-native-reanimated";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from "react-native-vision-camera";
import { sampleFrame } from "./sampleFrame";
import { runOnJS } from "react-native-reanimated";
import FastImage from "react-native-fast-image";
import { io } from "socket.io-client";
import { NoFlickerImage } from "react-native-no-flicker-image";

const App = () => {
  // DEV USAGE
  const [addr, setAddr] = useState("http://focusonyou.floweryk.com.ngrok.io");

  // PRODUCTION USAGE
  const [cameraType, setCameraType] = useState("back");
  const [mode, setMode] = useState("prod");
  const [image, setImage] = useState("");
  const [uri, setUri] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [fps, setFps] = useState(1);

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

  const toggleMode = () => {
    setMode(mode == "dev" ? "prod" : "dev");
  };

  useEffect(async () => {
    if (Camera.getCameraPermissionStatus !== "authorized") {
      await Camera.requestCameraPermission();
      setCameraType("front");
      setCameraType("back");
    }
  }, []);

  useEffect(() => {
    socket.current = io(addr);

    socket.current.on("connect", () => {
      console.log("connected");
      setIsConnected(true);
    });

    socket.current.on("disconnect", () => {
      console.log("disconnected");
      setIsConnected(false);
    });

    socket.current.on("connect_error", () => {
      console.log("error");
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
      socket.current.emit("request", { frame: image, mode: mode });
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
      <View style={styles.inputContainer}>
        <Text style={styles.prefix}>Address: </Text>
        <TextInput
          placeholder="Host address"
          autoCapitalize="none"
          defaultValue={addr}
          onSubmitEditing={(event) => setAddr(event.nativeEvent.text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.prefix}>FPS: </Text>
        <TextInput
          placeholder="Frame Processor fps"
          defaultValue={fps.toString()}
          onSubmitEditing={(event) =>
            setFps(parseFloat(event.nativeEvent.text))
          }
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.prefix}>Status: </Text>
        <Text>
          {isConnected ? "connected to server" : "not connected to server"}
        </Text>
      </View>
      <Camera
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={fps}
      />
      <NoFlickerImage
        style={{
          width: 300,
          height: 500,
          alignSelf: "center",
          margin: 50,
          transform: [{ rotate: cameraType == "front" ? "180deg" : "0deg" }],
        }}
        source={{ uri }}
      />
      <Button title="toggle camera" onPress={toggleCameraType} />
      <Button
        title={`switch to ${mode == "dev" ? "prod" : "dev"} mode`}
        onPress={toggleMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 10,
    marginVertical: 1,
    borderRadius: 10,
    height: 35,
  },
  prefix: {
    paddingHorizontal: 10,
    fontWeight: "bold",
    color: "black",
  },
});

export default App;
