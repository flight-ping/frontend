import { createRoute } from '@granite-js/react-native';
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';

export const Route = createRoute('/', {
  component: Page,
});

const COLORS = {
  primary: '#2979FF',
  background: '#F5F6FA',
  white: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#888888',
  urgent: '#FF5252',
  dday: '#EEF3FF',
  ddayText: '#2979FF',
  border: '#EEEEEE',
};

const DEALS = [
  {
    id: '1',
    section: '이번 주 특가 🔥',
    sectionSub: '놓치면 아까운 기간 한정 이벤트',
    items: [
      {
        id: 'd1',
        airline: '진에어',
        title: '일본 5대 노선 특가',
        dest: '후쿠오카, 도쿄 외 3개',
        price: '왕복 143,900원~',
        dday: 'D-12',
        urgent: false,
        color: '#2979FF',
      },
      {
        id: 'd2',
        airline: '티웨이항공',
        title: '번쩍특가 동남아',
        dest: '방콕, 다낭, 세부',
        price: '왕복 139,000원~',
        dday: 'D-2',
        urgent: true,
        color: '#E91E63',
      },
      {
        id: 'd3',
        airline: '에어서울',
        title: '방방곡곡 여행 특가',
        dest: '하노이, 오사카',
        price: '왕복 170,000원~',
        dday: 'D-20',
        urgent: false,
        color: '#00897B',
      },
    ],
  },
  {
    id: '2',
    section: '국내선 특가',
    sectionSub: '제주, 부산 출발',
    items: [
      {
        id: 'd4',
        airline: '제주항공',
        title: '여름 국내선 찜특가',
        dest: '제주, 부산, 광주',
        price: '왕복 57,900원~',
        dday: 'D-8',
        urgent: false,
        color: '#FF6600',
      },
      {
        id: 'd5',
        airline: '에어부산',
        title: '여름맞이 국내선 특가',
        dest: '제주, 김포',
        price: '왕복 49,900원~',
        dday: 'D-1',
        urgent: true,
        color: '#1E88E5',
      },
    ],
  },
];

type DealItem = {
  id: string;
  airline: string;
  title: string;
  dest: string;
  price: string;
  dday: string;
  urgent: boolean;
  color: string;
};

function DealCard({ item }: { item: DealItem }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={[styles.cardImg, { backgroundColor: item.color }]}>
        <Text style={styles.cardAirline}>{item.airline}</Text>
        <Text style={styles.cardTitleImg}>{item.title}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardDest}>{item.dest}</Text>
        <Text style={styles.cardName}>{item.title}</Text>
        <Text style={styles.cardPrice}>{item.price}</Text>
        <View style={[styles.ddayBadge, item.urgent && styles.ddayUrgent]}>
          <Text style={[styles.ddayText, item.urgent && styles.ddayTextUrgent]}>
            {item.dday}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Page() {
  const navigation = Route.useNavigation();

  const handleTabPress = (label: string) => {
    if (label === '비교') {
      navigation.navigate('/compare');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {DEALS.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{section.section}</Text>
              <Text style={styles.sectionSub}>{section.sectionSub}</Text>
            </View>
            <FlatList
              data={section.items}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.cardsRow}
              renderItem={({ item }) => <DealCard item={item} />}
            />
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.tabbar}>
        {[
          { label: '홈', active: true },
          { label: '비교', active: false },
          { label: '찜', active: false },
          { label: '마이', active: false },
        ].map((tab) => (
          <TouchableOpacity
              key={tab.label}
              style={styles.tab}
              onPress={() => handleTabPress(tab.label)}
            >
            <Text style={[styles.tabLabel, tab.active && styles.tabActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  section: { marginBottom: 20 },
  sectionHead: { paddingHorizontal: 20, marginTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  sectionSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  cardsRow: { paddingHorizontal: 20, gap: 10 },
  card: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cardImg: { height: 90, padding: 8, justifyContent: 'flex-end' },
  cardAirline: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  cardTitleImg: { fontSize: 12, fontWeight: '500', color: '#fff', lineHeight: 16 },
  cardBody: { padding: 9 },
  cardDest: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 2 },
  cardName: { fontSize: 12, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 3 },
  cardPrice: { fontSize: 12, fontWeight: '500', color: COLORS.primary },
  ddayBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.dday,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ddayUrgent: { backgroundColor: '#FFF0F0' },
  ddayText: { fontSize: 10, color: COLORS.ddayText },
  ddayTextUrgent: { color: COLORS.urgent },
  tabbar: {
    height: 58,
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 12, color: COLORS.textSecondary },
  tabActive: { color: COLORS.primary, fontWeight: '600' },
});