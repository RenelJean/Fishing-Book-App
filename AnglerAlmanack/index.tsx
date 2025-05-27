import 'expo-router/entry';
import { AppRegistry } from 'react-native';
import appJson from './app.json';
import App from './main.js'; // Make sure the path is correct

const appName = appJson.expo.name;

AppRegistry.registerComponent(appName, () => App);
