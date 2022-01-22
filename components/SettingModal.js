import { Button, StyleSheet, Switch, TextInput, View } from "react-native";
import Modal from "react-native-modal";
import TextBox from "./TextBox";

const styles = StyleSheet.create({
  content: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
});

const SettingModal = ({
  isModalVisible,
  setModalVisible,
  settings,
  setSettings,
}) => {
  const toggleDebug = () => {
    setSettings({ ...settings, isDebug: !settings.isDebug });
  };

  const toggleFaceDetect = () => {
    setSettings({ ...settings, faceDetect: !settings.faceDetect });
  };

  return (
    <Modal isVisible={isModalVisible}>
      <View style={styles.content}>
        <TextBox prefix="Host">
          <TextInput
            placeholder="Host address"
            defaultValue={settings.addr}
            onSubmitEditing={(event) =>
              setSettings({ ...settings, addr: event.nativeEvent.text })
            }
          />
        </TextBox>
        <TextBox prefix="FPS">
          <TextInput
            placeholder="Frame Processor FPS"
            defaultValue={settings.fps.toString()}
            onChangeText={(text) => {
              if (text)
                setSettings({
                  ...settings,
                  fps: parseFloat(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="width_seg">
          <TextInput
            placeholder="segmentation width"
            defaultValue={settings.width_seg.toString()}
            onChangeText={(text) => {
              if (text)
                setSettings({
                  ...settings,
                  width_seg: parseInt(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="width_fcr">
          <TextInput
            placeholder="segmentation width"
            defaultValue={settings.width_fcr.toString()}
            onChangeText={(text) => {
              if (text)
                setSettings({
                  ...settings,
                  width_fcr: parseInt(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="width_inp">
          <TextInput
            placeholder="inpainting width"
            defaultValue={settings.width_inp.toString()}
            onChangeText={(text) => {
              if (text)
                setSettings({
                  ...settings,
                  width_inp: parseInt(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="pad_ratio_known">
          <TextInput
            placeholder="padding ratio known"
            defaultValue={settings.pad_ratio_known.toString()}
            onChangeText={(text) => {
              if (text)
                setSettings({
                  ...settings,
                  pad_ratio_known: parseFloat(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="pad_ratio_unknown">
          <TextInput
            placeholder="padding ratio unknown"
            defaultValue={settings.pad_ratio_unknown.toString()}
            onChangeText={(text) => {
              if (text)
                setSettings({
                  ...settings,
                  pad_ratio_unknown: parseFloat(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="Debug mode">
          <Switch onValueChange={toggleDebug} value={settings.isDebug} />
        </TextBox>

        <TextBox prefix="Face Detect">
          <Switch
            onValueChange={toggleFaceDetect}
            value={settings.faceDetect}
          />
        </TextBox>
        <Button title="close" onPress={() => setModalVisible(false)} />
      </View>
    </Modal>
  );
};

export default SettingModal;
