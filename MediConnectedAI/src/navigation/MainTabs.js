import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeScreen} from '../screens/HomeScreen';
import {AppointmentsScreen} from '../screens/AppointmentsScreen';
import {ServicesHubScreen} from '../screens/ServicesHubScreen';
import {DoctorsScreen} from '../screens/DoctorsScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {colors} from '../constants/theme';

const Tab = createBottomTabNavigator();

function Icon({label, focused}) {
  const map = {Home: '🏠', Appointments: '📅', Services: '✚', Doctors: '👨‍⚕️', Profile: '👤'};
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
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{tabBarIcon: ({focused}) => <Icon label="Appointments" focused={focused} />}} />
      <Tab.Screen
        name="Services"
        component={ServicesHubScreen}
        options={{tabBarIcon: ({focused}) => <Icon label="Services" focused={focused} />}}
      />
      <Tab.Screen name="Doctors" component={DoctorsScreen} options={{tabBarIcon: ({focused}) => <Icon label="Doctors" focused={focused} />}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarIcon: ({focused}) => <Icon label="Profile" focused={focused} />}} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center', 
    justifyContent: 'center',
  },
  center: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    marginTop: -16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10201A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  on: {},
  icon: {fontSize: 20, fontWeight: '600'},
});
