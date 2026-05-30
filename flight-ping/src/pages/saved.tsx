import { createRoute } from '@granite-js/react-native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { type DealItem } from '../api/deals';
import { deleteSavedDeal, fetchSavedDeals } from '../api/saved';

const CARD_WIDTH = (Dimensions.get('window').width - 12 * 2 - 10) / 2;

export const Route = createRoute('/saved', {
  component: Page,
  screenOptions: { animation: 'none' },
});

// 타입

type TabType = 'flight' | 'deal';

type SavedFlight = {
  id: string;
  airline: string;
  flightNo: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  date: string;
};


// 색상

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

// 항공사 매핑 더미 데이터

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

const AIRPORT_CODE: Record<string, string> = {
  '인천': 'ICN', '김포': 'GMP', '부산': 'PUS', '대구': 'TAE',
  '제주': 'CJU', '청주': 'CJJ', '광주': 'KWJ', '무안': 'MWX', '양양': 'YNY',
  '도쿄': 'NRT', '오사카': 'KIX', '후쿠오카': 'FUK', '삿포로': 'CTS',
  '방콕': 'BKK', '다낭': 'DAD', '세부': 'CEB', '하노이': 'HAN', '호치민': 'SGN',
  '싱가포르': 'SIN', '홍콩': 'HKG', '타이베이': 'TPE', '괌': 'GUM',
};

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

const INITIAL_FLIGHTS: SavedFlight[] = [
  {
    id: 'f1',
    airline: '에어서울',
    flightNo: 'RS 101',
    departure: '인천',
    destination: '도쿄',
    departureTime: '16:50',
    arrivalTime: '19:10',
    duration: '2h 20m',
    stops: 0,
    price: 79900,
    date: '5월 26일 (월)',
  },
  {
    id: 'f2',
    airline: '제주항공',
    flightNo: '7C 1101',
    departure: '인천',
    destination: '오사카',
    departureTime: '06:05',
    arrivalTime: '08:20',
    duration: '2h 15m',
    stops: 0,
    price: 88000,
    date: '6월 3일 (화)',
  },
  {
    id: 'f3',
    airline: '진에어',
    flightNo: 'LJ 201',
    departure: '인천',
    destination: '도쿄',
    departureTime: '08:30',
    arrivalTime: '10:50',
    duration: '2h 20m',
    stops: 0,
    price: 95900,
    date: '6월 10일 (화)',
  },
];

function parseDday(dday: string): number {
  const match = dday.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// 컴포넌트

function FlightCard({
  item,
  onRemove,
  onPress,
}: {
  item: SavedFlight;
  onRemove: (id: string) => void;
  onPress: () => void;
}) {
  const logoUrl = getLogoUrl(item.airline);
  return (
    <TouchableOpacity style={styles.flightCard} onPress={onPress} activeOpacity={0.8}>
      {/* 날짜 + 찜 버튼 */}
      <View style={styles.flightTopRow}>
        <Text style={styles.flightDate}>{item.date}</Text>
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.heartIcon}>♥</Text>
        </TouchableOpacity>
      </View>

      {/* 시간 + 출도착지 */}
      <View style={styles.flightTimeRow}>
        <View style={styles.flightTimeCol}>
          <Text style={styles.flightTime}>{item.departureTime}</Text>
          <Text style={styles.flightAirport}>{item.departure}</Text>
          <Text style={styles.flightAirportCode}>{AIRPORT_CODE[item.departure] ?? ''}</Text>
        </View>
        <View style={styles.flightDurationRow}>
          <View style={styles.flightLine} />
          <Text style={styles.flightDuration}>
            {item.duration} · {item.stops === 0 ? '직항' : `경유 ${item.stops}`}
          </Text>
          <View style={styles.flightLine} />
        </View>
        <View style={styles.flightTimeCol}>
          <Text style={styles.flightTime}>{item.arrivalTime}</Text>
          <Text style={styles.flightAirport}>{item.destination}</Text>
          <Text style={styles.flightAirportCode}>{AIRPORT_CODE[item.destination] ?? ''}</Text>
        </View>
      </View>

      {/* 항공사 + 가격 */}
      <View style={styles.flightBottom}>
        <View style={styles.flightAirlineRow}>
          {logoUrl !== '' && (
            <Image source={{ uri: logoUrl }} style={styles.flightLogo} resizeMode="contain" />
          )}
          <Text style={styles.flightAirline}>{item.airline}</Text>
          <Text style={styles.flightNo}>{item.flightNo}</Text>
        </View>
        <Text style={styles.flightPrice}>{item.price.toLocaleString()}원~</Text>
      </View>
    </TouchableOpacity>
  );
}

function DealCard({
  item,
  onRemove,
  onPress,
}: {
  item: DealItem;
  onRemove: (id: number) => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.dealCard} onPress={onPress} activeOpacity={0.85}>
      {/* 컬러 상단 */}
      <View style={[styles.dealTop, !item.imageUrl && { backgroundColor: item.color }]}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        )}
        {item.imageUrl && <View style={styles.dealTopOverlay} />}
        <Text style={styles.dealTopAirline}>{item.airline}</Text>
        <Text style={styles.dealTopTitle} numberOfLines={2}>{item.title}</Text>
        <TouchableOpacity
          style={styles.dealHeartBtn}
          onPress={() => onRemove(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.dealHeartIcon}>♥</Text>
        </TouchableOpacity>
      </View>
      {/* 하단 정보 */}
      <View style={styles.dealBottom}>
        <Text style={styles.dealBottomDest} numberOfLines={1}>{item.dest}</Text>
        <View style={styles.dealBottomRow}>
          <Text style={styles.dealBottomPrice} numberOfLines={1}>{item.priceText}</Text>
          <View style={[styles.dealDdayBadge, item.urgent && styles.dealDdayBadgeUrgent]}>
            <Text style={[styles.dealDdayText, item.urgent && styles.dealDdayTextUrgent]}>
              {item.dday}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🤍</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function Page() {
  const navigation = Route.useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('flight');
  const [flights, setFlights] = useState<SavedFlight[]>(INITIAL_FLIGHTS);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [selectedDest, setSelectedDest] = useState<string>('전체');

  const loadSavedDeals = () => {
    fetchSavedDeals().then(setDeals).catch(console.error);
  };

  useEffect(() => {
    loadSavedDeals();
    return navigation.addListener('focus', loadSavedDeals);
  }, [navigation]);

  // 목적지 필터 옵션
  const destinations = ['전체', ...Array.from(new Set(flights.map((f) => f.destination)))];

  // 필터된 항공권
  const filteredFlights =
    selectedDest === '전체'
      ? flights
      : flights.filter((f) => f.destination === selectedDest);

  // 마감일순 정렬 특가
  const sortedDeals = [...deals].sort(
    (a, b) => parseDday(a.dday) - parseDday(b.dday),
  );

  const handleRemoveFlight = (id: string) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRemoveDeal = (id: number) => {
    deleteSavedDeal(id)
      .then(() => setDeals((prev) => prev.filter((d) => d.id !== id)))
      .catch(console.error);
  };

  const handleTabPress = (label: string) => {
    if (label === '홈') navigation.popToTop();
    if (label === '비교') navigation.navigate('/compare');
    if (label === '마이') navigation.navigate('/my');
  };

  return (
    <View style={styles.container}>
      {/* 상단 탭 */}
      <View style={styles.topTabBar}>
        {(['flight', 'deal'] as TabType[]).map((tab) => {
          const label = tab === 'flight' ? '항공권' : '특가';
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.topTab}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.topTabText, isActive && styles.topTabTextActive]}>
                {label}
              </Text>
              {isActive && <View style={styles.topTabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 항공권 탭 */}
      {activeTab === 'flight' && (
        <>
          {/* 목적지 필터 */}
          <View style={styles.filterBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterBarContent}
            >
              {destinations.map((dest) => (
                <TouchableOpacity
                  key={dest}
                  style={[styles.filterChip, selectedDest === dest && styles.filterChipActive]}
                  onPress={() => setSelectedDest(dest)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedDest === dest && styles.filterChipTextActive,
                    ]}
                  >
                    {dest}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredFlights.length === 0 ? (
              <EmptyState message="찜한 항공권이 없어요" />
            ) : (
              filteredFlights.map((item) => (
                <FlightCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveFlight}
                  onPress={() =>
                    Linking.openURL(
                      AIRLINE_URLS[item.airline] ?? 'https://www.google.com/travel/flights',
                    )
                  }
                />
              ))
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </>
      )}

      {/* 특가 탭 */}
      {activeTab === 'deal' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {sortedDeals.length === 0 ? (
            <EmptyState message="찜한 특가가 없어요" />
          ) : (
            <View style={styles.dealGrid}>
              {sortedDeals.map((item) => (
                <DealCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveDeal}
                  onPress={() => navigation.navigate('/deal-detail', { dealId: item.id })}
                />
              ))}
            </View>
          )}
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

// 스타일

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // 상단 탭
  topTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  topTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  topTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  topTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },

  // 목적지 필터
  filterBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingVertical: 9,
  },
  filterBarContent: {
    paddingHorizontal: 16,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    height: 28,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },

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
  },

  // 항공권 카드
  flightCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  flightTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  flightAirlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flightLogo: { width: 20, height: 20, borderRadius: 4 },
  flightAirline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
  },
  flightNo: { fontSize: 11, color: COLORS.textSecondary },
  flightDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444444',
  },
  flightTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  flightTimeCol: {
    alignItems: 'center',
  },
  flightTime: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  flightAirport: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  flightAirportCode: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  flightDurationRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flightLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  flightDuration: { fontSize: 10, color: COLORS.textSecondary },
  flightBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  flightPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // 특가 그리드
  dealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10,
  },
  dealCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  dealTop: {
    height: 96,
    padding: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  dealTopOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dealTopAirline: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 3,
  },
  dealTopTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 17,
  },
  dealHeartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  dealHeartIcon: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  dealBottom: {
    padding: 10,
  },
  dealBottomDest: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  dealBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  dealBottomPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },
  dealDdayBadge: {
    backgroundColor: COLORS.dday,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dealDdayBadgeUrgent: { backgroundColor: COLORS.urgentBg },
  dealDdayText: { fontSize: 9, color: COLORS.ddayText, fontWeight: '500' },
  dealDdayTextUrgent: { color: COLORS.urgent },

  // 공통
  heartIcon: { fontSize: 20, color: COLORS.heart },

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
