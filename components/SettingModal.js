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
            onSubmitEditing={(event) =>
              setFps(parseFloat(event.nativeEvent.text))
            }
          />
        </TextBox>
        <TextBox prefix="width_seg">
          <TextInput
            placeholder="segmentation width"
            defaultValue={options.width_seg.toString()}
            onSubmitEditing={(event) =>
              setOptions({
                ...options,
                width_seg: parseFloat(event.nativeEvent.text),
              })
            }
          />
        </TextBox>
        <TextBox prefix="width_inp">
          <TextInput
            placeholder="inpainting width"
            defaultValue={options.width_inp.toString()}
            onSubmitEditing={(event) =>
              setOptions({
                ...options,
                width_inp: parseFloat(event.nativeEvent.text),
              })
            }
          />
        </TextBox>
        <TextBox prefix="pad_ratio">
          <TextInput
            placeholder="padding ratio"
            defaultValue={options.pad_ratio.toString()}
            onSubmitEditing={(event) =>
              setOptions({
                ...options,
                pad_ratio: parseFloat(event.nativeEvent.text),
              })
            }
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
