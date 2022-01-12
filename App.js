import "react-native-reanimated";
import React, { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Switch, Text, View } from "react-native";
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from "react-native-vision-camera";
import { sampleFrame } from "./plugin/sampleFrame";
import { runOnJS } from "react-native-reanimated";
import { io } from "socket.io-client";
import TextBox from "./components/TextBox";
import toUri from "./utils/toUri";
import SettingModal from "./components/SettingModal";
import FastImage from "react-native-fast-image";
import { NoFlickerImage } from "react-native-no-flicker-image";

const styles = StyleSheet.create({
  image: {
    width: 400,
    height: 600,
    alignSelf: "center",
    margin: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

const App = () => {
  // settings
  const [addr, setAddr] = useState(
    "http://focusonyou.floweryk.com.jp.ngrok.io"
  );
  const [fps, setFps] = useState(2);
  const [isFront, setFront] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [settings, setSettings] = useState({
    isDebug: false,
    faceDetect: false,
    width_seg: 480,
    width_fcr: 480,
    width_inp: 200,
    pad_ratio_known: 0.01,
    pad_ratio_unknown: 0.04,
  });

  // states
  const [isConnect, setConnect] = useState(false);
  const [frame, setFrame] = useState("");
  const [uri, setUri] = useState("");
  const [lastSent, setLastSent] = useState("");
  const [lastReceived, setLastReceived] = useState("");

  // socket for communication
  const socket = useRef(null);

  // device definition
  const devices = useCameraDevices();
  const device = isFront ? devices.front : devices.back;

  // frame processor logic
  const frameProcessor = useFrameProcessor((data) => {
    "worklet";
    const result = sampleFrame(data, isFront);
    runOnJS(setFrame)(result.encoded);
  }, []);

  const toggleFront = () => {
    setFront(!isFront);
  };

  const toggleConenct = () => {
    if (isConnect) {
      disconnectSocket();
      setConnect(false);
    } else {
      connectSocket();
      setConnect(true);
    }
  };

  const connectSocket = () => {
    socket.current = io(addr);

    socket.current.on("connect", () => {
      console.log("connected");
    });

    socket.current.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.current.on("connect_error", () => {
      console.log("error");
      setConnect(false);
    });

    socket.current.on("response", (data) => {
      console.log("received");
      const date = new Date();
      setLastReceived(date.toString());

      const json = JSON.parse(data);

      const frameProcessed = json.frame;
      setUri(toUri(frameProcessed.slice(2, frameProcessed.length - 1)));
    });
  };

  const disconnectSocket = () => {
    socket.current.disconnect();
  };

  // request permission on mount
  useEffect(async () => {
    if (Camera.getCameraPermissionStatus !== "authorized") {
      await Camera.requestCameraPermission();
      toggleFront();
      toggleFront();
    }
  }, []);

  // emit event every frame
  useEffect(() => {
    if (socket.current?.connected) {
      console.log("request sent");
      const date = new Date();
      setLastSent(date.toString());

      const dataToSend = {
        frame,
        settings,
      };

      socket.current.emit("request", dataToSend);
    } else {
      console.log("request not sent");
      setUri(toUri(frame));
    }
  }, [frame]);

  if (device == null) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <TextBox prefix="Status: ">
        <Text>
          {socket.current?.connected
            ? "connected to server"
            : "not connected to server"}
        </Text>
      </TextBox>
      <View style={styles.buttonContainer}>
        <Switch onValueChange={toggleConenct} value={isConnect} />
        <Switch onValueChange={toggleFront} value={isFront} />
        <Button title="settings" onPress={() => setModalVisible(true)} />
      </View>
      <SettingModal
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        addr={addr}
        setAddr={setAddr}
        fps={fps}
        setFps={setFps}
        settings={settings}
        setSettings={setSettings}
      />
      <Camera
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={fps}
      />
      <Text>Last Sent: {lastSent}</Text>
      <Text>Last Received: {lastReceived}</Text>
      <NoFlickerImage style={styles.image} source={{ uri }} />
    </View>
  );
};

export default App;
