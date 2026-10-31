import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { usePrintQueue, type ConnectionState } from './src/usePrintQueue';

const STATUS_LABEL: Record<ConnectionState, string> = {
  init: 'Demarrage...',
  ok: 'En service',
  'network-error': 'Site injoignable',
  'auth-error': 'Jeton invalide',
  'printer-error': 'Probleme imprimante',
};

const STATUS_COLOR: Record<ConnectionState, string> = {
  init: '#8a8a8a',
  ok: '#1b7f3b',
  'network-error': '#b3261e',
  'auth-error': '#b3261e',
  'printer-error': '#b3261e',
};

function formatClock(timestamp: number | null): string {
  if (!timestamp) {
    return '--:--:--';
  }

  return new Date(timestamp).toLocaleTimeString('fr-FR');
}

export default function App() {
  const { connection, lastPollAt, printedCount, log } = usePrintQueue();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.banner, { backgroundColor: STATUS_COLOR[connection] }]}>
        <Text style={styles.bannerText}>{STATUS_LABEL[connection]}</Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{printedCount}</Text>
          <Text style={styles.metricLabel}>tickets imprimes</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{formatClock(lastPollAt)}</Text>
          <Text style={styles.metricLabel}>derniere verification</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Journal</Text>

      <ScrollView style={styles.log} contentContainerStyle={styles.logContent}>
        {log.length === 0 ? (
          <Text style={styles.logEmpty}>Aucune activite pour le moment.</Text>
        ) : (
          log.map((entry) => (
            <View key={`${entry.at}-${entry.message}`} style={styles.logRow}>
              <Text style={styles.logTime}>{formatClock(entry.at)}</Text>
              <Text style={[styles.logText, entry.level === 'error' && styles.logError]}>
                {entry.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#111315' },
  banner: { paddingVertical: 24, alignItems: 'center' },
  bannerText: { color: '#ffffff', fontSize: 22, fontWeight: '700' },
  metrics: { flexDirection: 'row', paddingVertical: 20 },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { color: '#ffffff', fontSize: 26, fontWeight: '600' },
  metricLabel: { color: '#9aa0a6', fontSize: 12, marginTop: 4 },
  sectionTitle: {
    color: '#9aa0a6',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  log: { flex: 1, backgroundColor: '#1b1e21' },
  logContent: { padding: 16 },
  logEmpty: { color: '#6b7177' },
  logRow: { flexDirection: 'row', marginBottom: 10 },
  logTime: { color: '#6b7177', fontSize: 12, width: 72 },
  logText: { color: '#e4e6e8', fontSize: 14, flex: 1 },
  logError: { color: '#ff8a80' },
});
