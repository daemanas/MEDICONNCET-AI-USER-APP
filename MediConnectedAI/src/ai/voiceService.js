import {Platform, PermissionsAndroid} from 'react-native';
import Tts from 'react-native-tts';
import Voice from '@react-native-voice/voice';

let voiceReady = false;
let ttsReady = false;

export async function initVoice() {
  try {
    Tts.getInitStatus?.()
      .then(() => {
        ttsReady = true;
        Tts.setDefaultLanguage('en-IN');
        Tts.setDefaultRate(0.42);
      })
      .catch(() => {
        ttsReady = false;
      });
  } catch {
    ttsReady = false;
  }

  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return {ok: false, reason: 'mic'};
      }
    }
    voiceReady = true;
    return {ok: true};
  } catch {
    return {ok: false, reason: 'voice_module'};
  }
}

export function speak(text) {
  if (!text) {
    return;
  }
  try {
    Tts.stop();
    Tts.speak(String(text));
  } catch {
    /* TTS not available on this device */
  }
}

export function stopSpeak() {
  try {
    Tts.stop();
  } catch {
    /* ignore */
  }
}

export async function startListening({onResult, onError, onPartial}) {
  if (!voiceReady) {
    const init = await initVoice();
    if (!init.ok) {
      onError?.(init.reason || 'voice_module');
      return;
    }
  }
  Voice.onSpeechResults = e => {
    const text = e.value?.[0];
    if (text) {
      onResult?.(text);
    }
  };
  Voice.onSpeechPartialResults = e => {
    const text = e.value?.[0];
    if (text) {
      onPartial?.(text);
    }
  };
  Voice.onSpeechError = e => {
    onError?.(e.error?.message || 'Could not hear that. Please try again.');
  };
  await Voice.start(Platform.OS === 'ios' ? 'en-US' : 'en-IN');
}

export async function stopListening() {
  try {
    await Voice.stop();
    Voice.removeAllListeners();
  } catch {
    /* ignore */
  }
}
