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
import { io } from "socket.io-client";
import { NoFlickerImage } from "react-native-no-flicker-image";

const App = () => {
  // DEV USAGE
  const [addr, setAddr] = useState("http://focusonyou.floweryk.com.ngrok.io");

  // PRODUCTION USAGE
  const [cameraType, setCameraType] = useState("back");
  const [mode, setMode] = useState("prod");
  const [frame, setFrame] = useState("");
  const [uri, setUri] = useState("");
  const [fps, setFps] = useState(1);

  const socket = useRef(null);

  const devices = useCameraDevices();
  const device = cameraType == "front" ? devices.front : devices.back;

  const frameProcessor = useFrameProcessor((data) => {
    "worklet";
    const result = sampleFrame(data);
    runOnJS(setFrame)(result.encoded);
  }, []);

  const toggleCameraType = () => {
    setCameraType(cameraType == "front" ? "back" : "front");
  };

  const toggleMode = () => {
    setMode(mode == "dev" ? "prod" : "dev");
  };

  const toUri = (image) => {
    return `data:image/jpeg;base64,${image}`;
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
    });

    socket.current.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.current.on("connect_error", () => {
      console.log("error");
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
  }, [addr]);

  // emit event
  useEffect(async () => {
    if (socket.current.connected) {
      console.log("request sent");

      const dataToSend = {
        frame,
        mode,
        cameraType,
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
          {socket.current.connected
            ? "connected to server"
            : "not connected to server"}
        </Text>
      </View>
      <Button title="toggle camera" onPress={toggleCameraType} />
      <Button
        title={`switch to ${mode == "dev" ? "prod" : "dev"} mode`}
        onPress={toggleMode}
      />
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
        }}
        source={{ uri }}
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
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default App;
