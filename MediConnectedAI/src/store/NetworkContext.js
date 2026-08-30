import React, {createContext, useContext, useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext({online: true});

export function NetworkProvider({children}) {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => {
      setOnline(!!s.isConnected);
    });
    NetInfo.fetch().then(s => setOnline(!!s.isConnected));
    return () => unsub();
  }, []);
  return <NetworkContext.Provider value={{online}}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  return useContext(NetworkContext);
}
