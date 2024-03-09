# React Native UDP Communication App

This is a React Native app that demonstrates UDP communication functionality. It allows you to listen for UDP messages on a specified port, send UDP messages to a target IP and port, and view log messages.

## Features

- Listen for UDP messages on a specified port
- Send UDP messages to a target IP and port
- View log messages with address, port, and message content

## Installation

1. Clone this repository:

```bash
git clone https://github.com/abhijeetadarsh/udp-communicator.git
```

2. Navigate to the project directory:

```bash
cd udp-communicator
```

3. Install dependencies:

```bash
npm install
```

## Usage

1. Run the app on an emulator or device:

```bash
npx expo run:android
```

or

```bash
npx expo run:ios
```

2. Enter the desired receiver port, target IP, target port, and message to send.

3. Press the "Listen" button to start listening for UDP messages.

4. Press the "Send" button to send a UDP message to the specified target IP and port.

5. View the log messages to see the received UDP messages and other events.

## Screenshots

![Screenshot 1](/screenshots/screenshot1.jpg)

## Dependencies

- "buffer"
- "expo"
- "expo-status-bar"
- "react"
- "react-native"
- "react-native-toast-message"
- "react-native-udp"

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
