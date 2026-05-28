import { createRoute } from '@granite-js/react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const Route = createRoute('/', {
  component: Page,
  screenOptions: { animation: 'none' },
});

// 타입

type SortTab = 'all' | 'deadline' | 'newest' | 'interested';

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

// 상수

const CARD_WIDTH = (Dimensions.get('window').width - 16 * 2 - 10) / 2;

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

const SORT_TABS: { key: SortTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'deadline', label: '마감임박순' },
  { key: 'newest', label: '최신순' },
  { key: 'interested', label: '관심노선' },
];

const DEALS: DealItem[] = [
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
];

const INTERESTED_DEALS: DealItem[] = [
  {
    id: 'rec1',
    airline: '진에어',
    title: '일본 5대 노선 특가',
    dest: '도쿄, 오사카 외 3개',
    price: '왕복 143,900원~',
    dday: 'D-12',
    urgent: false,
    color: '#2979FF',
  },
  {
    id: 'rec2',
    airline: '대한항공',
    title: '도쿄 얼리버드 특가',
    dest: '도쿄 (NRT)',
    price: '왕복 189,000원~',
    dday: 'D-5',
    urgent: true,
    color: '#1565C0',
  },
  {
    id: 'rec3',
    airline: '티웨이항공',
    title: '번쩍특가 동남아',
    dest: '방콕, 다낭, 세부',
    price: '왕복 139,000원~',
    dday: 'D-2',
    urgent: true,
    color: '#E91E63',
  },
];

// 유틸

function parseDday(dday: string): number {
  const match = dday.match(/\d+/);
  return match ? parseInt(match[0], 10) : 999;
}

// 컴포넌트

function DealCard({
  item,
  saved,
  onToggleSave,
  onPress,
}: {
  item: DealItem;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* 컬러 상단 */}
      <View style={[styles.cardTop, { backgroundColor: item.color }]}>
        <Text style={styles.cardAirline}>{item.airline}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => onToggleSave(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.heartIcon, saved && styles.heartSaved]}>
            {saved ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 하단 정보 */}
      <View style={styles.cardBottom}>
        <Text style={styles.cardDest} numberOfLines={1}>
          {item.dest}
        </Text>
        <View style={styles.cardBottomRow}>
          <Text style={styles.cardPrice} numberOfLines={1}>
            {item.price}
          </Text>
          <View style={[styles.ddayBadge, item.urgent && styles.ddayUrgent]}>
            <Text style={[styles.ddayText, item.urgent && styles.ddayTextUrgent]}>
              {item.dday}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ tab }: { tab: SortTab }) {
  const message =
    tab === 'interested'
      ? '마이 탭에서 관심 노선을\n추가해보세요'
      : '현재 진행 중인 특가가 없어요';
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>✈️</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// 페이지

function Page() {
  const navigation = Route.useNavigation();
  const [sortTab, setSortTab] = useState<SortTab>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const displayDeals = useMemo<DealItem[]>(() => {
    const base = sortTab === 'interested' ? INTERESTED_DEALS : DEALS;
    if (sortTab === 'deadline') {
      return [...base].sort((a, b) => parseDday(a.dday) - parseDday(b.dday));
    }
    if (sortTab === 'newest') {
      return [...base].sort((a, b) => b.id.localeCompare(a.id));
    }
    return base;
  }, [sortTab]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTabPress = (label: string) => {
    if (label === '비교') navigation.navigate('/compare');
    if (label === '찜') navigation.navigate('/saved');
    if (label === '마이') navigation.navigate('/my');
  };

  return (
    <View style={styles.container}>
      {/* 정렬 탭 */}
      <View style={styles.sortBar}>
        {SORT_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.sortTab, sortTab === tab.key && styles.sortTabActive]}
            onPress={() => setSortTab(tab.key)}
          >
            <Text
              style={[
                styles.sortTabText,
                sortTab === tab.key && styles.sortTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2열 그리드 */}
      <FlatList
        data={displayDeals}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState tab={sortTab} />}
        renderItem={({ item }) => (
          <DealCard
            item={item}
            saved={savedIds.has(item.id)}
            onToggleSave={toggleSave}
            onPress={() => navigation.navigate('/deal-detail')}
          />
        )}
      />

      {/* 탭바 */}
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

// 스타일

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // 정렬 탭
  sortBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  sortTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  sortTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortTabText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sortTabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },

  // 그리드
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: 10,
  },

  // 특가 카드
  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cardTop: {
    height: 100,
    padding: 12,
    justifyContent: 'flex-end',
  },
  cardAirline: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 17,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  heartIcon: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
  heartSaved: { color: COLORS.heart },

  // 카드 하단
  cardBottom: {
    padding: 10,
  },
  cardDest: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  cardPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },

  // D-day 뱃지
  ddayBadge: {
    backgroundColor: COLORS.dday,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ddayUrgent: { backgroundColor: '#FFF0F0' },
  ddayText: { fontSize: 9, color: COLORS.ddayText, fontWeight: '500' },
  ddayTextUrgent: { color: COLORS.urgent },

  // 빈 상태
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

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
