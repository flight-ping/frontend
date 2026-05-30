import { createRoute } from '@granite-js/react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchDealSections, fetchRecommendedDeals, type DealItem } from '../api/deals';
import { fetchInterestedRoutes } from '../api/interested-routes';

export const Route = createRoute('/', {
  component: Page,
  screenOptions: { animation: 'none' },
});

// 타입

type SortTab = 'deadline' | 'newest' | 'interested';

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
  { key: 'deadline', label: '마감임박순' },
  { key: 'newest', label: '최신순' },
  { key: 'interested', label: '관심노선' },
];


// 유틸

function parseDday(dday: string): number {
  const match = dday.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
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
  onToggleSave: (id: number) => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* 컬러 상단 */}
      <View style={[styles.cardTop, !item.imageUrl && { backgroundColor: item.color }]}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        )}
        {item.imageUrl && <View style={styles.cardTopOverlay} />}
        <Text style={styles.cardAirline}>{item.airline}</Text>
        <View style={{ flex: 1 }} />
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
            {item.priceText}
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

function EmptyState({ tab, hasInterestedRoutes }: { tab: SortTab; hasInterestedRoutes: boolean }) {
  const message =
    tab === 'interested'
      ? hasInterestedRoutes
        ? '관심 노선에 해당하는 진행 중인 특가가 없어요'
        : '마이 탭에서 관심 노선을\n추가해보세요'
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
  const [sortTab, setSortTab] = useState<SortTab>('deadline');
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [interestedDeals, setInterestedDeals] = useState<DealItem[]>([]);
  const [hasInterestedRoutes, setHasInterestedRoutes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const loadDeals = () => {
    setLoading(true);
    setSortTab('deadline');
    fetchDealSections()
      .then((sections) => setDeals(sections.flatMap((s) => s.items)))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDeals();
    return navigation.addListener('focus', loadDeals);
  }, [navigation]);

  useEffect(() => {
    if (sortTab === 'interested') {
      fetchInterestedRoutes()
        .then((routes) => setHasInterestedRoutes(routes.length > 0))
        .catch(console.error);
      fetchRecommendedDeals().then(setInterestedDeals).catch(console.error);
    }
  }, [sortTab]);

  const displayDeals = useMemo<DealItem[]>(() => {
    const base = sortTab === 'interested' ? interestedDeals : deals;
    if (sortTab === 'deadline') {
      return [...base].sort((a, b) => parseDday(a.dday) - parseDday(b.dday));
    }
    if (sortTab === 'newest') {
      return [...base].sort((a, b) => new Date(b.saleStart).getTime() - new Date(a.saleStart).getTime());
    }
    return base;
  }, [sortTab, deals, interestedDeals]);

  const toggleSave = (id: number) => {
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : null}
      <FlatList
        data={loading ? [] : displayDeals}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState tab={sortTab} hasInterestedRoutes={hasInterestedRoutes} />}
        renderItem={({ item }) => (
          <DealCard
            item={item}
            saved={savedIds.has(item.id)}
            onToggleSave={toggleSave}
            onPress={() => navigation.navigate('/deal-detail', { dealId: item.id })}
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
  loadingContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },

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
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardTopOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
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