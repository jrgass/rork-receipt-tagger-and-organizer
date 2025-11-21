import { Tabs } from "expo-router";
import { Receipt, FolderOpen } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet } from "react-native";

function RootLayoutNav() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#4F46E5',
        },
        headerTintColor: '#FFFFFF',
        headerTitle: () => (
          <Image 
            source={{ uri: 'https://rork.app/pa/8urgvidczzddmouwuecy4/alliance_logo' }}
            style={styles.logo}
            resizeMode="contain"
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Current Session",
          tabBarIcon: ({ color }) => <Receipt size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <FolderOpen size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 36,
  },
});

export default RootLayoutNav;