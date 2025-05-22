import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../services/firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fishing Book</Text>
      <Text style={styles.subtitle}>Login</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#6e5849"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#6e5849"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6e3', // soft cream old paper color
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#8b5e3c',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'serif',
    color: '#a57c49',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff8e1',
    borderColor: '#a57c49',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: 'serif',
    color: '#5b4226',
  },
  button: {
    backgroundColor: '#a57c49',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fdf6e3',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'serif',
    fontSize: 16,
  },
  link: {
    color: '#8b5e3c',
    fontFamily: 'serif',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  error: {
    color: '#c94f4f',
    marginBottom: 12,
    fontFamily: 'serif',
    textAlign: 'center',
  },
});
