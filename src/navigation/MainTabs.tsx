import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { theme } from '../theme/colors';

const Tab = createBottomTabNavigator();

interface MainTabsProps {
  onLogout: () => void;
  onNavigateToTransactionDetail: (id: number) => void;
  onNavigateToSettings: () => void;
}

export const MainTabs: React.FC<MainTabsProps> = ({
  onLogout,
  onNavigateToTransactionDetail,
  onNavigateToSettings
}) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent.primary,
        tabBarInactiveTintColor: theme.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.background.card,
          borderTopWidth: 1,
          borderTopColor: theme.border.primary,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      >
        {() => <HomeScreen onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="Transactions"
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} />,
        }}
      >
        {() => (
          <TransactionsScreen
            onTransactionPress={onNavigateToTransactionDetail}
            onBack={() => {}}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Chat"
        options={{
          tabBarLabel: 'AI Chat',
          tabBarIcon: ({ color }) => <TabIcon icon="💬" color={color} />,
        }}
      >
        {() => (
          <ChatScreen
            onBack={() => {}}
            onOpenSettings={onNavigateToSettings}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
        }}
      >
        {() => <SettingsScreen onBack={() => {}} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const TabIcon: React.FC<{ icon: string; color: string }> = ({ icon }) => {
  return <Text style={{ fontSize: 24 }}>{icon}</Text>;
};
