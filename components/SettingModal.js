import React from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import Modal from "react-native-modal";

const SettingModal = ({
  isVisible,
  setVisible,
  addr,
  setAddr,
  mode,
  setMode,
  fps,
  setFps,
}) => {
  return (
    <Modal isVisible={isVisible}>
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>Address: </Text>
          <TextInput
            placeholder="Host Address"
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
        <Button
          title={`switch to ${mode == "dev" ? "prod" : "dev"} mode`}
          onPress={() => setMode(mode == "dev" ? "prod" : "dev")}
        />
        <Button title="close modal" onPress={() => setVisible(false)} />
      </View>
    </Modal>
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
    minWidth: 300,
  },
  prefix: {
    paddingHorizontal: 10,
    fontWeight: "bold",
    color: "black",
  },
  content: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
});

export default SettingModal;
