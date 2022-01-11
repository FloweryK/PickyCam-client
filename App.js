import "react-native-reanimated";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  StyleSheet,
  Switch,
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
import { io } from "socket.io-client";
import { NoFlickerImage } from "react-native-no-flicker-image";
import TextBox from "./components/TextBox";
import toUri from "./utils/toUri";
import SettingModal from "./components/SettingModal";

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 500,
    alignSelf: "center",
    margin: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

const App = () => {
  // Setting modals
  const [addr, setAddr] = useState("http://focusonyou.floweryk.com.ngrok.io");
  const [isModalVisible, setModalVisible] = useState(false);
  const [options, setOptions] = useState({
    isDebug: false,
    faceDetect: true,
    width_seg: 480,
    width_fcr: 480,
    width_inp: 100,
    pad_ratio_known: 0.01,
    pad_ratio_unknown: 0.04,
  });
  const [fps, setFps] = useState(1);

  // states
  const [isConnect, setConnect] = useState(false);
  const [isFront, setFront] = useState(false);
  const [frame, setFrame] = useState("");
  const [uri, setUri] = useState("");

  const socket = useRef(null);

  const devices = useCameraDevices();
  const device = isFront ? devices.front : devices.back;

  const frameProcessor = useFrameProcessor((data) => {
    "worklet";
    const result = sampleFrame(data);
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

      const json = JSON.parse(data);
      const frameProcessed = json.frame;

      if (frameProcessed.length > 0) {
        setUri(toUri(frameProcessed.slice(2, frameProcessed.length - 1)));
      } else {
        setUri(toUri(frame));
      }
    });
  };

  const disconnectSocket = () => {
    socket.current.disconnect();
  };

  // request permission on mount
  useEffect(async () => {
    if (Camera.getCameraPermissionStatus !== "authorized") {
      await Camera.requestCameraPermission();
      setFront(true);
      setFront(false);
    }
  }, []);

  // emit event every frame
  useEffect(async () => {
    if (socket.current?.connected) {
      console.log("request sent");

      const dataToSend = {
        frame,
        options,
      };

      await socket.current.emit("request", dataToSend);
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
        options={options}
        setOptions={setOptions}
      />
      <Camera
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={fps}
      />
      <NoFlickerImage style={styles.image} source={{ uri }} />
    </View>
  );
};

export default App;
