import React, {useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {sendAiMessage, applyAiActions} from '../ai/aiService';
import {speak, startListening, stopListening, stopSpeak} from '../ai/voiceService';
import {PrimaryButton} from '../components/PrimaryButton';

export function AiAssistantScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {role: 'assistant', content: i18n.ai('empty')},
  ]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);

  const send = async text => {
    const msg = String(text || input).trim();
    if (!msg) {
      return;
    }
    setInput('');
    setMessages(prev => [...prev, {role: 'user', content: msg}]);
    setBusy(true);
    const reply = await sendAiMessage(msg);
    setMessages(prev => [...prev, {role: 'assistant', content: reply.text, actions: reply.actions}]);
    if (reply.speak) {
      speak(reply.text);
    }
    setBusy(false);
  };

  const onMic = async () => {
    if (listening) {
      await stopListening();
      setListening(false);
      return;
    }
    setListening(true);
    await startListening({
      onResult: t => {
        setListening(false);
        send(t);
      },
      onError: () => setListening(false),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Text style={[type.muted, styles.disc]}>{i18n.ai('disclaimer')}</Text>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.mine : styles.theirs]}>
            <Text style={item.role === 'user' ? styles.mineText : type.body}>{item.content}</Text>
            {(item.actions || []).map((a, i) => (
              <Pressable key={i} style={styles.action} onPress={() => applyAiActions({actions: [a]})}>
                <Text style={styles.actionText}>{labelFor(a)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      />
      <View style={styles.composer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={i18n.ai('placeholder')}
          style={styles.input}
          editable={!busy}
        />
        <View style={styles.row}>
          <PrimaryButton title={listening ? i18n.ai('stopSpeak') : i18n.ai('speak')} tone="ghost" onPress={onMic} />
          <PrimaryButton title={i18n.reports('send')} onPress={() => send()} disabled={busy} />
        </View>
        <Pressable onPress={stopSpeak}><Text style={type.muted}>{i18n.ai('stopSpeak')}</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

function labelFor(action) {
  const map = {
    findClinics: 'Find Nearby Clinics',
    findDoctors: 'Find Doctors',
    findHospitals: 'Find Hospitals',
    findPharmacies: 'Find Pharmacies',
    findLabs: 'Find Labs',
    openEmergency: 'Open Emergency',
    trackOrder: 'Track Order',
    openPrescriptions: 'Open Prescriptions',
    openReports: 'Open Reports',
    openHealthRecords: 'Open Health Records',
  };
  return map[action.tool] || action.screen || 'Open';
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  disc: {paddingHorizontal: space.md, paddingTop: space.sm},
  list: {padding: space.md, gap: 8},
  bubble: {padding: 12, borderRadius: 16, maxWidth: '90%'},
  mine: {alignSelf: 'flex-end', backgroundColor: colors.primary},
  theirs: {alignSelf: 'flex-start', backgroundColor: colors.surface},
  mineText: {color: '#fff'},
  action: {marginTop: 8, backgroundColor: colors.primarySoft, padding: 10, borderRadius: radius.pill, alignSelf: 'flex-start'},
  actionText: {color: colors.primaryDark, fontWeight: '800'},
  composer: {padding: space.md, gap: 8},
  input: {backgroundColor: colors.surface, borderRadius: 16, padding: 14, fontSize: 16, color: colors.text, minHeight: 50},
  row: {gap: 8},
});
