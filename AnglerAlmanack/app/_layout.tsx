import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';

export default function RootLayout() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return null; // or a splash screen
  }

  return (
    <Stack>
      {isSignedIn ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}
