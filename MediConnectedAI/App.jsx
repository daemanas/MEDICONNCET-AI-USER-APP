import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SessionProvider} from './src/store/SessionContext';
import {NetworkProvider} from './src/store/NetworkContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {initVoice} from './src/ai/voiceService';
import {colors} from './src/constants/theme';

function App() {
  useEffect(() => {
    initVoice();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <NetworkProvider>
          <SessionProvider>
            <RootNavigator />
          </SessionProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
