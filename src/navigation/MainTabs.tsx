import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { theme } from '../theme/colors';

const Tab = createBottomTabNavigator();

interface MainTabsProps {
  onLogout: () => void;
  onNavigateToTransactionDetail: (id: number) => void;
  onNavigateToSettings: () => void;
  onNavigateToCategoryManagement: () => void;
}

export const MainTabs: React.FC<MainTabsProps> = ({
  onLogout,
  onNavigateToTransactionDetail,
  onNavigateToSettings,
  onNavigateToCategoryManagement,
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
          paddingBottom: 20,
          paddingTop: 8,
          paddingLeft: 10,
          paddingRight: 10,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          paddingBottom: 5,
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
          tabBarLabel: 'Txns',
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
        name="Categories"
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
        }}
        component={CategoriesScreen}
      />

      <Tab.Screen
        name="Settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
        }}
      >
        {() => (
          <SettingsScreen
            onBack={() => {}}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const TabIcon: React.FC<{ icon: string; color: string }> = ({ icon }) => {
  return <Text style={{ fontSize: 24 }}>{icon}</Text>;
};
