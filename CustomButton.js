import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CustomButton = ({ title, onPress, isListening }) => {
  return (
    <TouchableOpacity
      style={[styles.button, isListening && styles.listeningButton]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{isListening ? "✖ Stop Listening" : title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  listeningButton: {
    backgroundColor: "#f54254", // Change color when listening
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});

export default CustomButton;
