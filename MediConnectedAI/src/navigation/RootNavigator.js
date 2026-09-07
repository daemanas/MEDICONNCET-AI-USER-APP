import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSession} from '../store/SessionContext';
import {navigationRef} from '../ai/aiTools';
import {colors} from '../constants/theme';
import {i18n} from '../i18n';
import {MainTabs} from './MainTabs';
import {LoginScreen} from '../screens/LoginScreen';
import {ProviderListScreen} from '../screens/ProviderListScreen';
import {ProviderDetailScreen} from '../screens/ProviderDetailScreen';
import {DoctorsScreen} from '../screens/DoctorsScreen';
import {SearchScreen} from '../screens/SearchScreen';
import {MedicinesScreen} from '../screens/MedicinesScreen';
import {CartScreen} from '../screens/CartScreen';
import {CheckoutScreen} from '../screens/CheckoutScreen';
import {OrderDetailScreen} from '../screens/OrderDetailScreen';
import {PrescriptionsScreen} from '../screens/PrescriptionsScreen';
import {PrescriptionDetailScreen} from '../screens/PrescriptionDetailScreen';
import {ReportsScreen} from '../screens/ReportsScreen';
import {ReportDetailScreen} from '../screens/ReportDetailScreen';
import {HealthRecordsScreen} from '../screens/HealthRecordsScreen';
import {HealthWalletScreen} from '../screens/HealthWalletScreen';
import {EmergencyScreen} from '../screens/EmergencyScreen';
import {ChatScreen} from '../screens/ChatScreen';
import {LocationPickerScreen} from '../screens/LocationPickerScreen';
import {NotificationsScreen} from '../screens/NotificationsScreen';
import {AiAssistantScreen} from '../screens/AiAssistantScreen';
import {AppointmentsScreen} from '../screens/AppointmentsScreen';
import {HospitalsScreen} from '../screens/HospitalsScreen';
import {ClinicsScreen} from '../screens/ClinicsScreen';
import {DiagnosticCentresScreen} from '../screens/DiagnosticCentresScreen';
import {MedicalShopsScreen} from '../screens/MedicalShopsScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const {ready, signedIn} = useSession();
  if (!ready) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg}}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.primaryDark,
          headerStyle: {backgroundColor: colors.bg},
          headerShadowVisible: false,
          contentStyle: {backgroundColor: colors.bg},
        }}>
        {signedIn ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{headerShown: false}} />
            <Stack.Screen name="Hospitals" component={HospitalsScreen} options={{headerShown: false}} />
            <Stack.Screen name="Clinics" component={ClinicsScreen} options={{headerShown: false}} />
            <Stack.Screen name="DiagnosticCentres" component={DiagnosticCentresScreen} options={{headerShown: false}} />
            <Stack.Screen name="MedicalShops" component={MedicalShopsScreen} options={{headerShown: false}} />
            <Stack.Screen name="ProviderList" component={ProviderListScreen} />
            <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} options={{title: i18n.services('details')}} />
            <Stack.Screen name="Doctors" component={DoctorsScreen} options={{title: i18n.services('doctors')}} />
            <Stack.Screen name="Search" component={SearchScreen} options={{title: i18n.t('searchPlaceholder')}} />
            <Stack.Screen name="Medicines" component={MedicinesScreen} options={{title: i18n.services('medicines')}} />
            <Stack.Screen name="Cart" component={CartScreen} options={{headerShown: false}} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{title: i18n.orders('confirmOrder')}} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{title: i18n.orders('title')}} />
            <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} options={{title: i18n.reports('prescriptionsTitle')}} />
            <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} options={{title: i18n.reports('prescriptionsTitle')}} />
            <Stack.Screen name="Reports" component={ReportsScreen} options={{title: i18n.reports('title')}} />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{title: i18n.reports('title')}} />
            <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} options={{title: i18n.reports('recordsTitle')}} />
            <Stack.Screen name="HealthWallet" component={HealthWalletScreen} options={{title: i18n.reports('walletTitle')}} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} options={{title: i18n.reports('emergencyTitle')}} />
            <Stack.Screen name="Chat" component={ChatScreen} options={({route}) => ({title: route.params?.name || i18n.reports('messagesTitle')})} />
            <Stack.Screen name="LocationPicker" component={LocationPickerScreen} options={{title: i18n.t('selectLocation')}} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{title: i18n.t('notifications')}} />
            <Stack.Screen name="AiAssistant" component={AiAssistantScreen} options={{title: i18n.ai('title')}} />
            <Stack.Screen name="Appointments" component={AppointmentsScreen} options={{title: i18n.services('requestConsult')}} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
