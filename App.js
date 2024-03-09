import React, { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Buffer } from "buffer";
import CustomButton from "./CustomButton";
import dgram from "react-native-udp";
import { ThemeProvider, useTheme } from "./ThemeContext";

const getStyles = (theme) =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: "#007AFF",
      paddingVertical: 10,
      paddingHorizontal: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    headerText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#fff",
    },
    container: {
      flex: 1,
      padding: 25,
      backgroundColor: theme === "dark" ? "#282a36" : "#f4f4f4",
    },
    input: {
      borderWidth: 1,
      borderColor: theme === "dark" ? "#6272a4" : "#ccc",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme === "dark" ? "#44475a" : "#fff",
      color: theme === "dark" ? "#f8f8f2" : "#333",
    },
    section: {
      marginTop: 20,
    },
    sectionTitle: {
      color: theme === "dark" ? "#f8f8f2" : "#333",
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    receivedDataText: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#333", // Dark text color
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      color: theme === "dark" ? "#f8f8f2" : "#333",
      fontSize: 16,
      marginBottom: 5,
    },
    logSection: {
      flex: 1, // Added to allow content to expand
    },
    logTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    logScrollView: {
      flexGrow: 1, // Added to allow content to expand
    },
    logContainer: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      padding: 10,
    },
    logMessageContainer: {
      marginBottom: 10,
    },
    logMessageHeading: {
      color: theme === "dark" ? "#f8f8f2" : "#333",
      fontWeight: "bold",
      marginBottom: 5,
    },
    logMessage: {
      color: theme === "dark" ? "#f8f8f2" : "#333",
      fontSize: 16,
    },
    safeArea: {
      flex: 1,
    },
  });

const AppContent = () => {
  const { theme, toggleTheme } = useTheme(); // Use the theme and toggleTheme
  const styles = getStyles(theme); // Get styles based on the current theme

  // udp reciever part
  const [receiverPort, setReceiverPort] = useState("5678");
  const [isListening, setIsListening] = useState(false);

  // udp sender part
  const [targetIP, setTargetIP] = useState("192.168.0.100");
  const [targetPort, setTargetPort] = useState("30000");
  const [messageToSend, setMessageToSend] = useState("Hi!  There");

  // response and logs
  const [logMessages, setLogMessages] = useState([]);

  // socket
  const [receiverSocket, setReceiverSocket] = useState(null);
  const [clientSocket, setClientSocket] = useState(null);

  const Header = () => {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>📡 UDP Connect</Text>
      </View>
    );
  };

  // Helper function to validate IP address
  const validateIP = (ip) => {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ip
    );
  };

  // Helper function to validate port number
  const validatePort = (port) => {
    return port > 0 && port <= 65535;
  };

  function logAndShow(message) {
    console.log(message); // Log to the console as usual
    Toast.show({
      type: "info",
      text1: "Log Message",
      text2: JSON.stringify(message, null, 2),
      position: "bottom",
      visibilityTime: 4000,
    });
  }

  // if (process.env.NODE_ENV === 'development') {
  if (process.env.NODE_ENV === "production") {
    console.log = () => {};
  }

  //------------------------------------------------------------------------------------
  useEffect(() => {
    if (!isListening) {
      return;
    }

    const newSocket = dgram.createSocket("udp4");
    setReceiverSocket(newSocket);
    const port = parseInt(receiverPort, 10);
    newSocket.bind(port);

    newSocket.on("error", (err) => {
      newSocket.close();
      setIsListening(false);
    });

    newSocket.on("message", (msg, rinfo) => {
      setLogMessages((prevLogMessages) => {
        const tmp = {
          address: rinfo.address,
          port: rinfo.port,
          message: msg.toString(),
        };
        return [tmp, ...prevLogMessages];
      });
    });

    newSocket.on("listening", () => {
      setIsListening(true);
    });

    return () => {
      if (newSocket) {
        newSocket.close();
      }
      setIsListening(false);
    };
  }, [isListening, receiverPort]);

  const handleListen = () => {
    setIsListening((current) => !current);
  };

  useEffect(() => {
    const client = dgram.createSocket("udp4");
    setClientSocket(client); // Store the client socket in state

    // Binding the client to a specific port, if necessary, can be done here
    client.bind();

    return () => {
      client.close();
    };
  }, []);

  const handleSend = () => {
    const port = parseInt(targetPort, 10);
    if (!validatePort(port) || !validateIP(targetIP)) {
      console.error("Invalid IP address or port number");
      logAndShow(`Invalid IP address or port number`);
      return;
    }

    const message = Buffer.from(messageToSend);

    if (clientSocket) {
      clientSocket.send(message, 0, message.length, port, targetIP, (err) => {
        if (err) {
          console.error(`Error while sending message: ${err.message}`);
          logAndShow(`Error while sending message`);
        } else {
          console.log(`Message sent successfully to ${targetIP}:${port}`);
        }
      });
    } else {
      console.error("Client socket does not exist or is not connected.");
      logAndShow(`Client socket does not exist or is not connected.`);
    }
  };
  //------------------------------------------------------------------------------------
  /*
  // Function to handle UDP listening
  const handleListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const socket = dgram.createSocket("udp4");
    const port = parseInt(receiverPort, 10); // Ensure the port is an integer
    socket.bind(port);

    socket.on("error", (err) => {
      console.log(`Server error:\n${err.stack}`);
      socket.close();
      setIsListening(false);
    });

    socket.on("message", (msg, rinfo) => {
      console.log(
        `Received message from ${rinfo.address}:${rinfo.port}: ${msg}`
      );

      setLogMessages((prevLogMessages) => {
        const tmp = {
          address: rinfo.address,
          port: rinfo.port,
          message: msg.toString(),
        };
        if (prevLogMessages.length > 19) {
          prevLogMessages.pop();
        }
        return [tmp, ...prevLogMessages];
      });
    });

    socket.on("listening", () => {
      const address = socket.address();
      console.log(`Server listening ${address.address}:${address.port}`);
      setIsListening(true);
    });
  };

  // Function to handle UDP message sending
  const handleSend = () => {
    const message = Buffer.from(messageToSend);
    const port = parseInt(targetPort, 10); // Ensure the port is an integer
    if (!validatePort(port) || !validateIP(targetIP)) {
      console.error("Invalid IP address or port number");
      return;
    }
    client.send(message, undefined, message.length, port, targetIP, (err) => {
      if (err) {
        console.error("Error while sending message:", err.message);
      } else {
        console.log(`Message sent successfully to ${targetIP}:${port}`);
      }
    });
  };
*/
  const placeholderTextColor = theme === "dark" ? "#fff" : "#000";
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Header />
        <View style={styles.container}>
          <CustomButton title="Toggle Theme" onPress={toggleTheme} />

          <View style={styles.section}>
            {/* UDP Receiver Section */}
            <Text style={styles.sectionTitle}>UDP Receiver</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Receiver Port</Text>
              <TextInput
                style={styles.input}
                placeholder="Receiver Port"
                placeholderTextColor={placeholderTextColor}
                value={receiverPort}
                onChangeText={setReceiverPort}
                keyboardType="numeric"
                editable={!isListening} // Disable input when isListening is true
              />
            </View>
            <CustomButton
              title="Listen"
              onPress={handleListen}
              isListening={isListening}
            />
          </View>

          <View style={styles.section}>
            {/* UDP Sender Section */}
            <Text style={styles.sectionTitle}>UDP Sender</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target IP</Text>
              <TextInput
                style={styles.input}
                placeholder="Target IP"
                placeholderTextColor={placeholderTextColor}
                value={targetIP}
                onChangeText={setTargetIP}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Port</Text>
              <TextInput
                style={styles.input}
                placeholder="Target Port"
                placeholderTextColor={placeholderTextColor}
                value={targetPort}
                onChangeText={setTargetPort}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message to Send</Text>
              <TextInput
                style={styles.input}
                placeholder="Message to Send"
                placeholderTextColor={placeholderTextColor}
                value={messageToSend}
                onChangeText={setMessageToSend}
              />
            </View>
            <CustomButton title="Send" onPress={handleSend} />
          </View>

          {/* Responses/Log Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Log</Text>
            <ScrollView style={styles.logContainer}>
              {logMessages.map((packet, index) => (
                <View key={index} style={styles.logMessageContainer}>
                  <Text
                    style={styles.logMessageHeading}
                  >{`[${packet.address}:${packet.port}]`}</Text>
                  <Text style={styles.logMessage}>{`${packet.message}`}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          <Toast />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
