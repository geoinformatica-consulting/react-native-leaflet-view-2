import * as React from 'react';

import { StyleSheet, SafeAreaView } from 'react-native';
import { LeafletView } from 'react-native-leaflet';


export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <LeafletView
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
