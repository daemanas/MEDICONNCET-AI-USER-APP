import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TextInput, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {messageApi} from '../api/messageApi';
import {useSession} from '../store/SessionContext';
import {PrimaryButton} from '../components/PrimaryButton';
import {ScreenState} from '../components/ScreenState';

export function ChatScreen() {
  const {id} = useRoute().params;
  const {user} = useSession();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await messageApi.messages(id);
      setMessages(data.messages || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 12000);
    return () => clearInterval(t);
  }, [id]);

  const send = async () => {
    if (!body.trim()) {
      return;
    }
    const msg = await messageApi.send(id, body.trim());
    setMessages(prev => [...prev, msg.message || msg]);
    setBody('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenState loading={loading} error={error} onRetry={load}>
        <FlatList
          data={messages}
          keyExtractor={(m, i) => m._id || m.id || String(i)}
          contentContainerStyle={styles.list}
          renderItem={({item}) => {
            const mine = String(item.senderUserId) === String(user?._id || user?.id);
            return (
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={mine ? styles.mineText : type.body}>{item.body}</Text>
              </View>
            );
          }}
        />
        <View style={styles.composer}>
          <TextInput value={body} onChangeText={setBody} placeholder={i18n.reports('typeMessage')} style={styles.input} />
          <PrimaryButton title={i18n.reports('send')} onPress={send} />
        </View>
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  list: {padding: space.md, gap: 8},
  bubble: {maxWidth: '80%', padding: 12, borderRadius: 16},
  mine: {alignSelf: 'flex-end', backgroundColor: colors.primary},
  theirs: {alignSelf: 'flex-start', backgroundColor: colors.surface},
  mineText: {color: '#fff'},
  composer: {padding: space.md, gap: 8},
  input: {backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, fontSize: 16, color: colors.text},
});
