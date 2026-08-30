import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeScreen} from '../screens/HomeScreen';
import {OrdersScreen} from '../screens/OrdersScreen';
import {ServicesHubScreen} from '../screens/ServicesHubScreen';
import {MessagesScreen} from '../screens/MessagesScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {colors} from '../constants/theme';

const Tab = createBottomTabNavigator();

function Icon({label, focused}) {
  const map = {Home: '🏠', Orders: '📦', Services: '✚', Messages: '💬', Profile: '👤'};
  return (
    <View style={[styles.iconWrap, label === 'Services' && styles.center, focused && styles.on]}>
      <Text style={styles.icon}>{map[label]}</Text>
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarStyle: {height: 64, paddingBottom: 8, paddingTop: 8, backgroundColor: colors.surface},
        tabBarLabelStyle: {fontWeight: '700', fontSize: 11},
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{tabBarIcon: ({focused}) => <Icon label="Home" focused={focused} />}} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{tabBarIcon: ({focused}) => <Icon label="Orders" focused={focused} />}} />
      <Tab.Screen
        name="Services"
        component={ServicesHubScreen}
        options={{tabBarIcon: ({focused}) => <Icon label="Services" focused={focused} />}}
      />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{tabBarIcon: ({focused}) => <Icon label="Messages" focused={focused} />}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarIcon: ({focused}) => <Icon label="Profile" focused={focused} />}} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {alignItems: 'center', justifyContent: 'center'},
  center: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primarySoft,
    marginTop: -10,
  },
  on: {},
  icon: {fontSize: 18},
});
