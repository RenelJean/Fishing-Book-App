import { AppRegistry } from 'react-native';
import App from './App.js'; // Make sure the path is correct
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
