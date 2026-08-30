import React from 'react';
import {Alert, Linking} from 'react-native';
import {i18n} from '../i18n';

export function confirmCall(phone) {
  if (!phone) {
    return;
  }
  Alert.alert(i18n.t('callConfirmTitle'), `${i18n.t('callConfirmBody')}\n\n${phone}`, [
    {text: i18n.t('cancel'), style: 'cancel'},
    {
      text: i18n.t('call'),
      onPress: () => Linking.openURL(`tel:${phone}`),
    },
  ]);
}
