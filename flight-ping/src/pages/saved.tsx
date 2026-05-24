import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const Route = createRoute('/saved', {
  component: Page,
});

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type SavedEvent = {
  id: string;
  airline: string;
  title: string;
  departure: string;
  dest: string;
  flag: string;
  saleStart: string;
  saleEnd: string;
  price: number;
  dday: string;
  urgent: boolean;
};

// ─── 더미 데이터 ──────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#2979FF',
  background: '#F5F6FA',
  white: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#888888',
  urgent: '#FF5252',
  urgentBg: '#FFF0F0',
  dday: '#EEF3FF',
  ddayText: '#2979FF',
  border: '#EEEEEE',
  heart: '#FF5252',
};

const INITIAL_SAVED: SavedEvent[] = [
  {
    id: 's1',
    airline: '티웨이항공',
    title: '번쩍특가 동남아',
    departure: '인천',
    dest: '방콕',
    flag: '🇹🇭',
    saleStart: '2025.05.18',
    saleEnd: '2025.05.20',
    price: 139000,
    dday: 'D-2',
    urgent: true,
  },
  {
    id: 's2',
    airline: '필리핀항공',
    title: '세부 여름 특가',
    departure: '인천',
    dest: '세부',
    flag: '🇵🇭',
    saleStart: '2025.05.19',
    saleEnd: '2025.05.19',
    price: 209000,
    dday: 'D-1',
    urgent: true,
  },
  {
    id: 's3',
    airline: '에어부산',
    title: '여름맞이 국내선 특가',
    departure: '김포',
    dest: '제주',
    flag: '🇰🇷',
    saleStart: '2025.05.18',
    saleEnd: '2025.05.19',
    price: 49900,
    dday: 'D-1',
    urgent: true,
  },
  {
    id: 's4',
    airline: '진에어',
    title: '일본 5대 노선 특가',
    departure: '인천',
    dest: '도쿄',
    flag: '🇯🇵',
    saleStart: '2025.05.15',
    saleEnd: '2025.05.30',
    price: 143900,
    dday: 'D-12',
    urgent: false,
  },
  {
    id: 's5',
    airline: '에어서울',
    title: '방방곡곡 여행 특가',
    departure: '인천',
    dest: '후쿠오카',
    flag: '🇯🇵',
    saleStart: '2025.05.10',
    saleEnd: '2025.05.28',
    price: 168000,
    dday: 'D-8',
    urgent: false,
  },
];

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🤍</Text>
      <Text style={styles.emptyTitle}>아직 찜한 특가가 없어요</Text>
      <Text style={styles.emptyDesc}>
        마음에 드는 특가를 찜해두면{'\n'}여기서 모아볼 수 있어요
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onBrowse}>
        <Text style={styles.emptyButtonText}>특가 둘러보기</Text>
      </TouchableOpacity>
    </View>
  );
}

function UrgentCard({
  item,
  onRemove,
}: {
  item: SavedEvent;
  onRemove: (id: string) => void;
}) {
  return (
    <View style={styles.urgentCard}>
      <View style={styles.urgentCardTop}>
        <Text style={styles.urgentAirline}>{item.airline}</Text>
        <View style={styles.urgentDdayBadge}>
          <Text style={styles.urgentDdayText}>{item.dday}</Text>
        </View>
      </View>
      <Text style={styles.urgentFlag}>{item.flag}</Text>
      <Text style={styles.urgentDest}>{item.dest}</Text>
      <Text style={styles.urgentRoute}>
        {item.departure} → {item.dest}
      </Text>
      <Text style={styles.urgentPrice}>{item.price.toLocaleString()}원~</Text>
      <TouchableOpacity
        style={styles.urgentRemoveBtn}
        onPress={() => onRemove(item.id)}
      >
        <Text style={styles.heartIcon}>♥</Text>
      </TouchableOpacity>
    </View>
  );
}

function SavedCard({
  item,
  onRemove,
}: {
  item: SavedEvent;
  onRemove: (id: string) => void;
}) {
  return (
    <View style={styles.savedCard}>
      <View style={styles.savedCardBody}>
        <View style={styles.savedCardTop}>
          <View style={styles.savedCardTopLeft}>
            <Text style={styles.savedFlag}>{item.flag}</Text>
            <Text style={styles.savedAirline}>{item.airline}</Text>
          </View>
          <View style={[styles.ddayBadge, item.urgent && styles.ddayBadgeUrgent]}>
            <Text style={[styles.ddayText, item.urgent && styles.ddayTextUrgent]}>
              {item.dday}
            </Text>
          </View>
        </View>
        <Text style={styles.savedTitle}>{item.title}</Text>
        <Text style={styles.savedRoute}>
          {item.departure} → {item.dest}
        </Text>
        <Text style={styles.savedPeriod}>
          판매 {item.saleStart} ~ {item.saleEnd}
        </Text>
        <Text style={styles.savedPrice}>{item.price.toLocaleString()}원~</Text>
      </View>
      <TouchableOpacity
        style={styles.savedRemoveBtn}
        onPress={() => onRemove(item.id)}
      >
        <Text style={styles.heartIcon}>♥</Text>
      </TouchableOpacity>
    </View>
  );
}

function Page() {
  const navigation = Route.useNavigation();
  const [saved, setSaved] = useState<SavedEvent[]>(INITIAL_SAVED);

  const urgentItems = saved.filter((e) => e.urgent);
  const isEmpty = saved.length === 0;

  const handleRemove = (id: string) => {
    setSaved((prev) => prev.filter((e) => e.id !== id));
  };

  const handleTabPress = (label: string) => {
    if (label === '홈') {
      navigation.goBack();
    }
    if (label === '비교') {
      navigation.navigate('/compare');
    }
    if (label === '마이') {
      navigation.navigate('/my');
    }
  };

  return (
    <View style={styles.container}>
      {isEmpty ? (
        <EmptyState onBrowse={() => navigation.goBack()} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 마감 임박 섹션 */}
          {urgentItems.length > 0 && (
            <View style={styles.urgentSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⏰ 마감 임박</Text>
                <Text style={styles.sectionSub}>곧 판매가 종료돼요</Text>
              </View>
              <FlatList
                horizontal
                data={urgentItems}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.urgentList}
                renderItem={({ item }) => (
                  <UrgentCard item={item} onRemove={handleRemove} />
                )}
                scrollEnabled
              />
            </View>
          )}

          {/* 전체 찜 목록 */}
          <View style={styles.allSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>전체</Text>
              <Text style={styles.sectionCount}>{saved.length}개</Text>
            </View>
            {saved.map((item) => (
              <SavedCard key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* 탭바 */}
      <View style={styles.tabbar}>
        {[
          { label: '홈', active: false },
          { label: '비교', active: false },
          { label: '찜', active: true },
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

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // 빈 상태
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  // 공통 섹션 헤더
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.urgent,
  },
  sectionCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

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
  urgentCard: {
    width: 150,
    backgroundColor: COLORS.urgentBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },
  urgentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  urgentAirline: {
    fontSize: 10,
    color: COLORS.textSecondary,
    flex: 1,
  },
  urgentDdayBadge: {
    backgroundColor: COLORS.urgent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentDdayText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '700',
  },
  urgentFlag: { fontSize: 24, marginBottom: 4 },
  urgentDest: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  urgentRoute: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  urgentPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.urgent,
  },
  urgentRemoveBtn: {
    position: 'absolute',
    bottom: 10,
    right: 12,
  },

  // 전체 찜 목록
  allSection: {
    backgroundColor: COLORS.white,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  savedCardBody: { flex: 1 },
  savedCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  savedCardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedFlag: { fontSize: 16 },
  savedAirline: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ddayBadge: {
    backgroundColor: COLORS.dday,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ddayBadgeUrgent: { backgroundColor: COLORS.urgentBg },
  ddayText: {
    fontSize: 10,
    color: COLORS.ddayText,
    fontWeight: '500',
  },
  ddayTextUrgent: { color: COLORS.urgent },
  savedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  savedRoute: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  savedPeriod: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  savedPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  savedRemoveBtn: {
    paddingLeft: 16,
    paddingVertical: 8,
  },

  // 공통
  heartIcon: {
    fontSize: 20,
    color: COLORS.heart,
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
