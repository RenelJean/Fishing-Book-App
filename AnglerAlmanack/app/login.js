import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import LoginScreen from '../screens/LoginScreen';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/(tabs)');
      }
    });

    return unsubscribe;
  }, [router]);

  return <LoginScreen />;
}