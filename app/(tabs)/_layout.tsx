import { Tabs } from 'expo-router';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useColors } from '@/constants';

function TabBarBackground() {
  const scheme = useColorScheme();
  return <BlurView intensity={70} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />;
}

export default function TabsLayout() {
  const COLORS = useColors();
  const scheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: scheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
          borderTopColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          borderTopWidth: 0.5,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#bbb',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subir"
        options={{
          tabBarIcon: () => (
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6, marginBottom: 6 }}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="guardados"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={25} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
