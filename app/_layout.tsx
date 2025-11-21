import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SessionProvider } from "@/hooks/session-store";
import { Image, StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#4F46E5',
      },
      headerTintColor: '#FFFFFF',
      headerTitle: () => (
        <Image 
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/q3jw4is11k0dook28za4w' }}
          style={styles.logo}
          resizeMode="contain"
        />
      ),
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ 
        presentation: "modal" 
      }} />
      <Stack.Screen name="receipt-details" options={{ 
        presentation: "modal"
      }} />
      <Stack.Screen name="submit-session" options={{ 
        presentation: "modal"
      }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 36,
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <SessionProvider>
          <RootLayoutNav />
        </SessionProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}