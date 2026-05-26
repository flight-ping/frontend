import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const Route = createRoute('/flights', {
  component: Page,
});

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type SortKey = 'price' | 'departure' | 'arrival';

type FlightResult = {
  id: string;
  airline: string;
  flightNo: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
};

// ─── 더미 데이터 ──────────────────────────────────────────────────────────────

const FLIGHTS: FlightResult[] = [
  {
    id: 'f1',
    airline: '제주항공',
    flightNo: '7C 1101',
    departureTime: '06:05',
    arrivalTime: '08:20',
    duration: '2h 15m',
    stops: 0,
    price: 88000,
  },
  {
    id: 'f2',
    airline: '진에어',
    flightNo: 'LJ 201',
    departureTime: '08:30',
    arrivalTime: '10:50',
    duration: '2h 20m',
    stops: 0,
    price: 95900,
  },
  {
    id: 'f3',
    airline: '티웨이항공',
    flightNo: 'TW 201',
    departureTime: '10:15',
    arrivalTime: '12:35',
    duration: '2h 20m',
    stops: 0,
    price: 103000,
  },
  {
    id: 'f4',
    airline: '아시아나항공',
    flightNo: 'OZ 111',
    departureTime: '12:40',
    arrivalTime: '15:00',
    duration: '2h 20m',
    stops: 0,
    price: 148000,
  },
  {
    id: 'f5',
    airline: '대한항공',
    flightNo: 'KE 703',
    departureTime: '14:30',
    arrivalTime: '16:50',
    duration: '2h 20m',
    stops: 0,
    price: 172000,
  },
  {
    id: 'f6',
    airline: '에어서울',
    flightNo: 'RS 101',
    departureTime: '16:50',
    arrivalTime: '19:10',
    duration: '2h 20m',
    stops: 0,
    price: 79900,
  },
  {
    id: 'f7',
    airline: '진에어',
    flightNo: 'LJ 207',
    departureTime: '19:25',
    arrivalTime: '21:50',
    duration: '2h 25m',
    stops: 0,
    price: 91000,
  },
  {
    id: 'f8',
    airline: '대한항공',
    flightNo: 'KE 711',
    departureTime: '21:10',
    arrivalTime: '23:35',
    duration: '2h 25m',
    stops: 0,
    price: 159000,
  },
];

// ─── 항공사 로고 ──────────────────────────────────────────────────────────────

const AIRLINE_IATA: Record<string, string> = {
  '대한항공': 'KE',
  '아시아나항공': 'OZ',
  '제주항공': '7C',
  '진에어': 'LJ',
  '티웨이항공': 'TW',
  '에어서울': 'RS',
  '에어부산': 'BX',
  '에어프레미아': 'YP',
};

function getLogoUrl(airline: string): string {
  const iata = AIRLINE_IATA[airline];
  return iata
    ? `https://www.gstatic.com/flights/airline_logos/70px/${iata}.png`
    : '';
}

// ─── 항공사 홈페이지 링크 ────────────────────────────────────────────────────

const AIRLINE_URLS: Record<string, string> = {
  '대한항공': 'https://www.koreanair.com',
  '아시아나항공': 'https://flyasiana.com',
  '제주항공': 'https://www.jejuair.net',
  '진에어': 'https://www.jinair.com',
  '티웨이항공': 'https://www.twayair.com',
  '에어서울': 'https://www.airseoul.com',
  '에어부산': 'https://www.airbusan.com',
  '에어프레미아': 'https://www.airpremia.com',
};

function openAirlineWebsite(airline: string) {
  const url = AIRLINE_URLS[airline] ?? 'https://www.google.com/travel/flights';
  Linking.openURL(url);
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'price', label: '최저가순' },
  { key: 'departure', label: '출발시간순' },
  { key: 'arrival', label: '도착시간순' },
];

const COLORS = {
  primary: '#2979FF',
  background: '#F5F6FA',
  white: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#888888',
  border: '#EEEEEE',
  directBg: '#EEF3FF',
  directText: '#2979FF',
};

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

function FlightCard({
  flight,
  saved,
  onToggleSave,
  onPress,
}: {
  flight: FlightResult;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* 항공사 + 편명 */}
      <View style={styles.cardTop}>
        <View style={styles.airlineRow}>
          {getLogoUrl(flight.airline) !== '' && (
            <Image
              source={{ uri: getLogoUrl(flight.airline) }}
              style={styles.airlineLogo}
              resizeMode="contain"
            />
          )}
          <Text style={styles.airlineName}>{flight.airline}</Text>
          <Text style={styles.flightNo}>{flight.flightNo}</Text>
        </View>
      </View>

      {/* 시간 + 가격 */}
      <View style={styles.cardBody}>
        {/* 시간 정보 */}
        <View style={styles.timeSection}>
          <Text style={styles.time}>{flight.departureTime}</Text>
          <View style={styles.durationRow}>
            <View style={styles.durationLine} />
            <Text style={styles.durationText}>{flight.duration}</Text>
            <View style={styles.durationLine} />
          </View>
          <Text style={styles.time}>{flight.arrivalTime}</Text>
        </View>

        {/* 직항 배지 + 가격 + 찜 */}
        <View style={styles.rightSection}>
          <View style={styles.stopsBadge}>
            <Text style={styles.stopsBadgeText}>
              {flight.stops === 0 ? '직항' : `경유 ${flight.stops}`}
            </Text>
          </View>
          <Text style={styles.price}>
            {flight.price.toLocaleString()}원~
          </Text>
          <TouchableOpacity
            onPress={() => onToggleSave(flight.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.heart, saved && styles.heartSaved]}>
              {saved ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// TODO: API 연동 시 compare에서 departure(IATA), destination(IATA), date(YYYY-MM-DD) params 수신

function Page() {
  const navigation = Route.useNavigation();
  const [sortBy, setSortBy] = useState<SortKey>('price');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sorted = [...FLIGHTS].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'departure') return a.departureTime.localeCompare(b.departureTime);
    return a.arrivalTime.localeCompare(b.arrivalTime);
  });

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerRoute}>인천 → 도쿄</Text>
          <Text style={styles.headerDate}>5월 26일 (월) · 편도</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* 정렬 탭 */}
      <View style={styles.sortBar}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.sortTab, sortBy === opt.key && styles.sortTabActive]}
            onPress={() => setSortBy(opt.key)}
          >
            <Text
              style={[
                styles.sortTabText,
                sortBy === opt.key && styles.sortTabTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 결과 수 */}
      <Text style={styles.resultCount}>{sorted.length}개 항공편</Text>

      {/* 항공편 리스트 */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {sorted.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            saved={savedIds.has(flight.id)}
            onToggleSave={toggleSave}
            onPress={() => openAirlineWebsite(flight.airline)}
          />
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backText: { fontSize: 22, color: COLORS.textPrimary },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRoute: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // 정렬 탭
  sortBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
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
  },
  sortTabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },

  // 결과 수
  resultCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  // 스크롤
  scroll: { flex: 1 },

  // 항공편 카드
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  airlineLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  airlineName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  flightNo: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // 시간 섹션
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  time: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  durationRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  durationText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  // 우측 섹션
  rightSection: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 12,
  },
  stopsBadge: {
    backgroundColor: COLORS.directBg,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stopsBadgeText: {
    fontSize: 11,
    color: COLORS.directText,
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heart: {
    fontSize: 18,
    color: COLORS.border,
  },
  heartSaved: {
    color: '#FF5252',
  },
});
