import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {providerApi} from '../api/providerApi';
import {ScreenState} from '../components/ScreenState';
import {formatDate} from '../utils/format';

export function AppointmentsScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    providerApi
      .appointments()
      .then(d => setRows(d.appointments || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenState loading={loading} error={error} empty={!loading && !rows.length} emptyText="No consultations yet.">
        <FlatList
          data={rows}
          keyExtractor={item => item._id || item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <Text style={styles.card}>
              <Text style={type.h3}>{item.status}{'\n'}</Text>
              <Text style={type.body}>{item.reason}{'\n'}</Text>
              <Text style={type.small}>{formatDate(item.scheduledAt)}</Text>
            </Text>
          )}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  list: {padding: space.md},
  card: {backgroundColor: colors.surface, padding: space.md, borderRadius: radius.lg, marginBottom: 8, overflow: 'hidden'},
});
