import { signOut } from 'firebase/auth';
import { Button, StyleSheet, Text, View } from 'react-native';
import { auth } from '../services/firebaseConfig';

export default function HomeScreen() {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Fishing Book</Text>
      <Text style={styles.subtitle}>Your personal fishing journal</Text>
      <Button title="Logout" color="#a57c49" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6e3',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'serif',
    color: '#8b5e3c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'serif',
    color: '#a57c49',
    marginBottom: 24,
  },
});
