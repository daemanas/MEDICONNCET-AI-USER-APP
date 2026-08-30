import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, space, type} from '../constants/theme';
import {reportApi} from '../api/reportApi';
import {ScreenState} from '../components/ScreenState';
import {formatDate} from '../utils/format';

export function ReportDetailScreen() {
  const {id, kind} = useRoute().params;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi
      .one(id, kind)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, kind]);

  const report = data?.report;
  const facility = data?.facility;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenState loading={loading} error={error}>
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={type.title}>{report?.testName || report?.title || 'Report'}</Text>
          <Text style={type.muted}>{facility?.name}</Text>
          <Text style={type.small}>{formatDate(report?.reportDate || report?.createdAt)}</Text>
          <Text style={type.body}>{report?.summary || report?.remarks || report?.body || ''}</Text>
          {(report?.results || []).map((r, i) => (
            <Text key={i} style={type.body}>
              {r.name || r.test}: {r.value} {r.unit || ''}
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
});
