import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
  heart: '#FF5252',
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

const URGENT_ITEMS = DEALS.flatMap((s) => s.items).filter((item) => item.urgent);

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

function UrgentCard({
  item,
  saved,
  onToggleSave,
}: {
  item: DealItem;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  return (
    <View style={styles.urgentCard}>
      <View style={[styles.urgentBanner, { backgroundColor: item.color }]}>
        <Text style={styles.urgentAirline}>{item.airline}</Text>
        <View style={styles.urgentDdayBadge}>
          <Text style={styles.urgentDdayText}>{item.dday}</Text>
        </View>
      </View>
      <View style={styles.urgentBody}>
        <Text style={styles.urgentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.urgentDest} numberOfLines={1}>{item.dest}</Text>
        <View style={styles.urgentFooter}>
          <Text style={styles.urgentPrice}>{item.price}</Text>
          <TouchableOpacity
            onPress={() => onToggleSave(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.heartIcon, saved && styles.heartSaved]}>
              {saved ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function DealCard({
  item,
  saved,
  onToggleSave,
}: {
  item: DealItem;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardImg, { backgroundColor: item.color }]}>
        <Text style={styles.cardAirline}>{item.airline}</Text>
        <Text style={styles.cardTitleImg}>{item.title}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardDest}>{item.dest}</Text>
        <Text style={styles.cardName}>{item.title}</Text>
        <Text style={styles.cardPrice}>{item.price}</Text>
        <View style={styles.cardFooter}>
          <View style={[styles.ddayBadge, item.urgent && styles.ddayUrgent]}>
            <Text style={[styles.ddayText, item.urgent && styles.ddayTextUrgent]}>
              {item.dday}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onToggleSave(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.heartIcon, saved && styles.heartSaved]}>
              {saved ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function Page() {
  const navigation = Route.useNavigation();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDealPress = (_id: string) => {
    navigation.navigate('/deal-detail');
  };

  const handleTabPress = (label: string) => {
    if (label === '비교') {
      navigation.navigate('/compare');
    }
    if (label === '찜') {
      navigation.navigate('/saved');
    }
    if (label === '마이') {
      navigation.navigate('/my');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 마감 임박 섹션 */}
        {URGENT_ITEMS.length > 0 && (
          <View style={styles.urgentSection}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>⏰ 마감 임박</Text>
              <Text style={styles.urgentSub}>놓치면 후회해요</Text>
            </View>
            <FlatList
              horizontal
              data={URGENT_ITEMS}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.urgentList}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleDealPress(item.id)} activeOpacity={0.9}>
                  <UrgentCard
                    item={item}
                    saved={savedIds.has(item.id)}
                    onToggleSave={toggleSave}
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* 특가 섹션들 */}
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
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleDealPress(item.id)} activeOpacity={0.9}>
                  <DealCard
                    item={item}
                    saved={savedIds.has(item.id)}
                    onToggleSave={toggleSave}
                  />
                </TouchableOpacity>
              )}
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

  // 마감 임박 섹션
  urgentSection: {
    backgroundColor: COLORS.white,
    paddingBottom: 16,
    marginBottom: 8,
  },
  urgentList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  urgentSub: {
    fontSize: 12,
    color: COLORS.urgent,
  },
  urgentCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  urgentBanner: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 8,
  },
  urgentAirline: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  urgentDdayBadge: {
    backgroundColor: COLORS.urgent,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentDdayText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '700',
  },
  urgentBody: { padding: 10 },
  urgentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  urgentDest: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  urgentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgentPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.urgent,
    flex: 1,
  },

  // 특가 섹션
  section: { marginBottom: 8 },
  sectionHead: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  sectionSub: { fontSize: 12, color: COLORS.textSecondary },
  cardsRow: { paddingHorizontal: 20, gap: 10 },

  // DealCard
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
  cardPrice: { fontSize: 12, fontWeight: '500', color: COLORS.primary, marginBottom: 6 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ddayBadge: {
    backgroundColor: COLORS.dday,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ddayUrgent: { backgroundColor: '#FFF0F0' },
  ddayText: { fontSize: 10, color: COLORS.ddayText },
  ddayTextUrgent: { color: COLORS.urgent },

  // 공통 하트
  heartIcon: { fontSize: 16, color: COLORS.border },
  heartSaved: { color: COLORS.heart },

  // 탭바
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
