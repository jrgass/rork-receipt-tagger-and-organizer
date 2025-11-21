import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SessionProvider } from "@/hooks/session-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ 
        title: "Capture Receipt",
        presentation: "modal" 
      }} />
      <Stack.Screen name="receipt-details" options={{ 
        title: "Receipt Details",
        presentation: "modal"
      }} />
      <Stack.Screen name="submit-session" options={{ 
        title: "Submit Session",
        presentation: "modal"
      }} />
    </Stack>
  );
}

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