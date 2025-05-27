import { Link } from 'expo-router';
import { Button } from 'react-native';
import HomeScreen from "../screens/HomeScreen";

<Link href="/signup" asChild>
  <Button title="Sign Up" />
</Link>

export default function home() {
return <HomeScreen />;
}