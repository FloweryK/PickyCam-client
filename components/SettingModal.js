import { Button, StyleSheet, Switch, TextInput, View } from "react-native";
import Modal from "react-native-modal";
import TextBox from "./TextBox";

const SettingModal = ({
  isModalVisible,
  setModalVisible,
  addr,
  setAddr,
  fps,
  setFps,
  options,
  setOptions,
}) => {
  const toggleDebug = () => {
    setOptions({ ...options, isDebug: !options.isDebug });
  };

  return (
    <Modal isVisible={isModalVisible}>
      <View style={styles.content}>
        <TextBox prefix="address">
          <TextInput
            placeholder="Host address"
            defaultValue={addr}
            onSubmitEditing={(event) => setAddr(event.nativeEvent.text)}
          />
        </TextBox>
        <TextBox prefix="FPS">
          <TextInput
            placeholder="Frame Processor FPS"
            defaultValue={fps.toString()}
            onChangeText={(text) => {
              if (text) setFps(parseFloat(text));
            }}
          />
        </TextBox>
        <TextBox prefix="width_seg">
          <TextInput
            placeholder="segmentation width"
            defaultValue={options.width_seg.toString()}
            onChangeText={(text) => {
              if (text)
                setOptions({
                  ...options,
                  width_seg: parseInt(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="width_fcr">
          <TextInput
            placeholder="segmentation width"
            defaultValue={options.width_fcr.toString()}
            onChangeText={(text) => {
              if (text)
                setOptions({
                  ...options,
                  width_fcr: parseInt(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="width_inp">
          <TextInput
            placeholder="inpainting width"
            defaultValue={options.width_inp.toString()}
            onChangeText={(text) => {
              if (text)
                setOptions({
                  ...options,
                  width_inp: parseInt(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="pad_ratio_known">
          <TextInput
            placeholder="padding ratio known"
            defaultValue={options.pad_ratio_known.toString()}
            onChangeText={(text) => {
              if (text)
                setOptions({
                  ...options,
                  pad_ratio_known: parseFloat(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="pad_ratio_unknown">
          <TextInput
            placeholder="padding ratio unknown"
            defaultValue={options.pad_ratio_unknown.toString()}
            onChangeText={(text) => {
              if (text)
                setOptions({
                  ...options,
                  pad_ratio_unknown: parseFloat(text),
                });
            }}
          />
        </TextBox>
        <TextBox prefix="Debug mode">
          <Switch onValueChange={toggleDebug} value={options.isDebug} />
        </TextBox>
        <Button title="close" onPress={() => setModalVisible(false)} />
      </View>
    </Modal>
  );
};

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

export default SettingModal;
