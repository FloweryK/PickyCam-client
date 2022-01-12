import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
    minWidth: "30%",
  },
  prefix: {
    paddingHorizontal: 10,
    fontWeight: "bold",
    color: "black",
  },
});

const SwitchBox = ({ prefix, children }) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.prefix}>{prefix}</Text>
      {children}
    </View>
  );
};

export default SwitchBox;
