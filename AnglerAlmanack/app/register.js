import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import SignupScreen from '../screens/SignupScreen';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/(tabs)');
      }
    });

    return unsubscribe;
  }, [router]);

  return <SignupScreen />;
}