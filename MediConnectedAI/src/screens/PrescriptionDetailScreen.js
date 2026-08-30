import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, space, type} from '../constants/theme';
import {reportApi} from '../api/reportApi';
import {ScreenState} from '../components/ScreenState';
import {formatDate} from '../utils/format';

export function PrescriptionDetailScreen() {
  const {id} = useRoute().params;
  const [row, setRow] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi
      .prescription(id)
      .then(d => setRow(d.prescription))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const meds = row?.medicines || [];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenState loading={loading} error={error}>
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={type.title}>{row?.doctor?.name}</Text>
          <Text style={type.muted}>{row?.facility?.name}</Text>
          <Text style={type.small}>{formatDate(row?.issuedAt)}</Text>
          {row?.diagnosis ? <Text style={type.body}>Diagnosis note: {row.diagnosis}</Text> : null}
          <Text style={[type.h3, styles.mt]}>Medicines</Text>
          {meds.map((m, i) => (
            <View key={i} style={styles.box}>
              <Text style={type.h3}>{m.name}</Text>
              <Text style={type.muted}>
                {[m.strength, m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}
              </Text>
              {m.instructions ? <Text style={type.body}>{m.instructions}</Text> : null}
            </View>
          ))}
          {(row?.investigations || []).length ? <Text style={type.h3}>Tests advised</Text> : null}
          {(row?.investigations || []).map((inv, i) => (
            <Text key={i} style={type.body}>
              {inv.name}
            </Text>
          ))}
          {row?.advice ? <Text style={type.body}>{row.advice}</Text> : null}
          {(row?.adviceItems || []).map((a, i) => (
            <Text key={i} style={type.body}>
              • {a}
            </Text>
          ))}
        </ScrollView>
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.lg, gap: 8},
  mt: {marginTop: space.md},
  box: {backgroundColor: colors.surface, padding: space.md, borderRadius: 16},
});
