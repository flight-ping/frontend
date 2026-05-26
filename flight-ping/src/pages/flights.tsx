import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const Route = createRoute('/flights', {
  component: Page,
});

function Page() {
  const navigation = Route.useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <View style={styles.body}>
        <Text style={styles.emoji}>✈️</Text>
        <Text style={styles.title}>항공편 검색 결과</Text>
        <Text style={styles.desc}>준비 중이에요</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  backBtn: { padding: 20, paddingTop: 52 },
  backText: { fontSize: 22, color: '#111111' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emoji: { fontSize: 48 },
  title: { fontSize: 18, fontWeight: '700', color: '#111111' },
  desc: { fontSize: 14, color: '#888888' },
});
