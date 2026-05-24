import { createRoute } from '@granite-js/react-native';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const Route = createRoute('/compare', {
  component: Page,
});

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type Airport =
  | '인천'
  | '김포'
  | '부산'
  | '대구'
  | '제주'
  | '청주'
  | '광주'
  | '무안'
  | '양양';

type PickerTarget = 'departure' | 'dest';

type FlightEvent = {
  id: string;
  airline: string;
  title: string;
  saleStart: string;
  saleEnd: string;
  price: number;
  dday: string;
  urgent: boolean;
};

type RouteItem = {
  id: string;
  departure: Airport;
  dest: string;
  country: string;
  flag: string;
  minPrice: number;
  events: FlightEvent[];
};

// ─── 더미 데이터 ──────────────────────────────────────────────────────────────

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
  eventBg: '#F8FAFF',
  overlay: 'rgba(0,0,0,0.4)',
};

const AIRPORTS: Airport[] = [
  '인천', '김포', '부산', '대구', '제주', '청주', '광주', '무안', '양양',
];

const ALL_ROUTES: RouteItem[] = [
  // ── 인천 출발 ────────────────────────────────────────────────────────────────
  {
    id: 'icn-nrt',
    departure: '인천',
    dest: '도쿄',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 143900,
    events: [
      {
        id: 'e-icn-nrt-1',
        airline: '진에어',
        title: '일본 5대 노선 특가',
        saleStart: '2025.05.15',
        saleEnd: '2025.05.30',
        price: 143900,
        dday: 'D-12',
        urgent: false,
      },
      {
        id: 'e-icn-nrt-2',
        airline: '대한항공',
        title: '여름 성수기 특가',
        saleStart: '2025.05.20',
        saleEnd: '2025.06.01',
        price: 189000,
        dday: 'D-20',
        urgent: false,
      },
    ],
  },
  {
    id: 'icn-bkk',
    departure: '인천',
    dest: '방콕',
    country: '태국',
    flag: '🇹🇭',
    minPrice: 139000,
    events: [
      {
        id: 'e-icn-bkk-1',
        airline: '티웨이항공',
        title: '번쩍특가 동남아',
        saleStart: '2025.05.18',
        saleEnd: '2025.05.20',
        price: 139000,
        dday: 'D-2',
        urgent: true,
      },
    ],
  },
  {
    id: 'icn-fuk',
    departure: '인천',
    dest: '후쿠오카',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 168000,
    events: [
      {
        id: 'e-icn-fuk-1',
        airline: '에어서울',
        title: '방방곡곡 여행 특가',
        saleStart: '2025.05.10',
        saleEnd: '2025.05.28',
        price: 168000,
        dday: 'D-8',
        urgent: false,
      },
    ],
  },
  {
    id: 'icn-han',
    departure: '인천',
    dest: '하노이',
    country: '베트남',
    flag: '🇻🇳',
    minPrice: 175000,
    events: [
      {
        id: 'e-icn-han-1',
        airline: '베트남항공',
        title: '하노이 특가',
        saleStart: '2025.05.12',
        saleEnd: '2025.05.25',
        price: 175000,
        dday: 'D-5',
        urgent: false,
      },
      {
        id: 'e-icn-han-2',
        airline: '비엣젯항공',
        title: '베트남 이벤트 특가',
        saleStart: '2025.05.14',
        saleEnd: '2025.05.28',
        price: 183000,
        dday: 'D-8',
        urgent: false,
      },
    ],
  },
  {
    id: 'icn-ceb',
    departure: '인천',
    dest: '세부',
    country: '필리핀',
    flag: '🇵🇭',
    minPrice: 209000,
    events: [
      {
        id: 'e-icn-ceb-1',
        airline: '필리핀항공',
        title: '세부 여름 특가',
        saleStart: '2025.05.19',
        saleEnd: '2025.05.19',
        price: 209000,
        dday: 'D-1',
        urgent: true,
      },
    ],
  },
  // ── 김포 출발 ────────────────────────────────────────────────────────────────
  {
    id: 'gmp-jeju',
    departure: '김포',
    dest: '제주',
    country: '대한민국',
    flag: '🇰🇷',
    minPrice: 49900,
    events: [
      {
        id: 'e-gmp-jeju-1',
        airline: '에어부산',
        title: '여름맞이 국내선 특가',
        saleStart: '2025.05.18',
        saleEnd: '2025.05.19',
        price: 49900,
        dday: 'D-1',
        urgent: true,
      },
      {
        id: 'e-gmp-jeju-2',
        airline: '제주항공',
        title: '여름 국내선 찜특가',
        saleStart: '2025.05.15',
        saleEnd: '2025.05.23',
        price: 57900,
        dday: 'D-8',
        urgent: false,
      },
    ],
  },
  {
    id: 'gmp-pus',
    departure: '김포',
    dest: '부산(김해)',
    country: '대한민국',
    flag: '🇰🇷',
    minPrice: 38900,
    events: [
      {
        id: 'e-gmp-pus-1',
        airline: '진에어',
        title: '국내선 봄 특가',
        saleStart: '2025.05.10',
        saleEnd: '2025.05.20',
        price: 38900,
        dday: 'D-3',
        urgent: true,
      },
    ],
  },
  // ── 부산 출발 ────────────────────────────────────────────────────────────────
  {
    id: 'pus-nrt',
    departure: '부산',
    dest: '도쿄',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 149000,
    events: [
      {
        id: 'e-pus-nrt-1',
        airline: '진에어',
        title: '부산발 일본 특가',
        saleStart: '2025.05.14',
        saleEnd: '2025.05.28',
        price: 149000,
        dday: 'D-8',
        urgent: false,
      },
    ],
  },
  {
    id: 'pus-fuk',
    departure: '부산',
    dest: '후쿠오카',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 129000,
    events: [
      {
        id: 'e-pus-fuk-1',
        airline: '에어부산',
        title: '후쿠오카 특가',
        saleStart: '2025.05.12',
        saleEnd: '2025.05.25',
        price: 129000,
        dday: 'D-5',
        urgent: false,
      },
    ],
  },
  {
    id: 'pus-osa',
    departure: '부산',
    dest: '오사카',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 155000,
    events: [
      {
        id: 'e-pus-osa-1',
        airline: '에어부산',
        title: '부산-오사카 특가',
        saleStart: '2025.05.15',
        saleEnd: '2025.05.31',
        price: 155000,
        dday: 'D-11',
        urgent: false,
      },
    ],
  },
  // ── 대구 출발 ────────────────────────────────────────────────────────────────
  {
    id: 'tae-osa',
    departure: '대구',
    dest: '오사카',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 168000,
    events: [
      {
        id: 'e-tae-osa-1',
        airline: '에어대구',
        title: '대구-오사카 특가',
        saleStart: '2025.05.20',
        saleEnd: '2025.06.05',
        price: 168000,
        dday: 'D-16',
        urgent: false,
      },
    ],
  },
  // ── 제주 출발 ────────────────────────────────────────────────────────────────
  {
    id: 'cju-gmp',
    departure: '제주',
    dest: '서울(김포)',
    country: '대한민국',
    flag: '🇰🇷',
    minPrice: 49900,
    events: [
      {
        id: 'e-cju-gmp-1',
        airline: '제주항공',
        title: '제주-서울 특가',
        saleStart: '2025.05.17',
        saleEnd: '2025.05.21',
        price: 49900,
        dday: 'D-1',
        urgent: true,
      },
    ],
  },
  {
    id: 'cju-icn',
    departure: '제주',
    dest: '서울(인천)',
    country: '대한민국',
    flag: '🇰🇷',
    minPrice: 55900,
    events: [
      {
        id: 'e-cju-icn-1',
        airline: '티웨이항공',
        title: '제주발 인천 특가',
        saleStart: '2025.05.15',
        saleEnd: '2025.05.28',
        price: 55900,
        dday: 'D-8',
        urgent: false,
      },
    ],
  },
  // ── 청주 출발 ────────────────────────────────────────────────────────────────
  {
    id: 'cjj-osa',
    departure: '청주',
    dest: '오사카',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 159000,
    events: [
      {
        id: 'e-cjj-osa-1',
        airline: '티웨이항공',
        title: '청주발 오사카 특가',
        saleStart: '2025.05.15',
        saleEnd: '2025.05.31',
        price: 159000,
        dday: 'D-11',
        urgent: false,
      },
    ],
  },
  {
    id: 'cjj-nrt',
    departure: '청주',
    dest: '도쿄',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 172000,
    events: [
      {
        id: 'e-cjj-nrt-1',
        airline: '진에어',
        title: '청주-도쿄 특가',
        saleStart: '2025.05.18',
        saleEnd: '2025.05.25',
        price: 172000,
        dday: 'D-5',
        urgent: false,
      },
    ],
  },
  // ── 광주 출발 ────────────────────────────────────────────────────────────────
  {
    id: 'kwj-osa',
    departure: '광주',
    dest: '오사카',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 165000,
    events: [
      {
        id: 'e-kwj-osa-1',
        airline: '에어서울',
        title: '광주발 오사카 특가',
        saleStart: '2025.05.20',
        saleEnd: '2025.06.03',
        price: 165000,
        dday: 'D-14',
        urgent: false,
      },
    ],
  },
  // ── 무안 출발 ────────────────────────────────────────────────────────────────
  {
    id: 'mwx-bkk',
    departure: '무안',
    dest: '방콕',
    country: '태국',
    flag: '🇹🇭',
    minPrice: 219000,
    events: [
      {
        id: 'e-mwx-bkk-1',
        airline: '타이항공',
        title: '무안발 방콕 특가',
        saleStart: '2025.05.19',
        saleEnd: '2025.06.01',
        price: 219000,
        dday: 'D-12',
        urgent: false,
      },
    ],
  },
  {
    id: 'mwx-osa',
    departure: '무안',
    dest: '오사카',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 158000,
    events: [
      {
        id: 'e-mwx-osa-1',
        airline: '제주항공',
        title: '무안-오사카 특가',
        saleStart: '2025.05.17',
        saleEnd: '2025.05.20',
        price: 158000,
        dday: 'D-2',
        urgent: true,
      },
    ],
  },
  // ── 양양 출발 ────────────────────────────────────────────────────────────────
  {
    id: 'yny-nrt',
    departure: '양양',
    dest: '도쿄',
    country: '일본',
    flag: '🇯🇵',
    minPrice: 189000,
    events: [
      {
        id: 'e-yny-nrt-1',
        airline: '플라이강원',
        title: '양양발 도쿄 특가',
        saleStart: '2025.05.22',
        saleEnd: '2025.06.10',
        price: 189000,
        dday: 'D-17',
        urgent: false,
      },
    ],
  },
];

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

function EventCard({ event }: { event: FlightEvent }) {
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventCardHeader}>
        <Text style={styles.eventAirline}>{event.airline}</Text>
        <View style={[styles.ddayBadge, event.urgent && styles.ddayUrgent]}>
          <Text style={[styles.ddayText, event.urgent && styles.ddayTextUrgent]}>
            {event.dday}
          </Text>
        </View>
      </View>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventPeriod}>
        판매 {event.saleStart} ~ {event.saleEnd}
      </Text>
      <Text style={styles.eventPrice}>{event.price.toLocaleString()}원~</Text>
    </View>
  );
}

function RouteRow({
  route,
  expanded,
  onToggle,
}: {
  route: RouteItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View>
      <TouchableOpacity style={styles.routeRow} onPress={onToggle} activeOpacity={0.75}>
        <View style={styles.routeLeft}>
          <Text style={styles.routeFlag}>{route.flag}</Text>
          <View>
            <Text style={styles.routeDest}>{route.dest}</Text>
            <Text style={styles.routeCountry}>{route.country}</Text>
          </View>
        </View>
        <View style={styles.routeRight}>
          <Text style={styles.routeMinPrice}>
            최저 {route.minPrice.toLocaleString()}원
          </Text>
          <Text style={styles.routeChevron}>{expanded ? '∧' : '∨'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.eventsContainer}>
          {route.events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>
      )}

      <View style={styles.divider} />
    </View>
  );
}

function Page() {
  const navigation = Route.useNavigation();
  const [departure, setDeparture] = useState<Airport>('인천');
  const [dest, setDest] = useState<string>('전체');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);

  const availableDests = useMemo(() => {
    const dests = ALL_ROUTES
      .filter((r) => r.departure === departure)
      .map((r) => r.dest);
    return ['전체', ...dests];
  }, [departure]);

  const filteredRoutes = useMemo(
    () =>
      ALL_ROUTES.filter(
        (r) => r.departure === departure && (dest === '전체' || r.dest === dest),
      ),
    [departure, dest],
  );

  const pickerOptions: string[] =
    pickerTarget === 'departure' ? AIRPORTS : availableDests;

  const handlePickerSelect = (option: string) => {
    if (pickerTarget === 'departure') {
      setDeparture(option as Airport);
      setDest('전체');
      setExpandedId(null);
    } else {
      setDest(option);
      setExpandedId(null);
    }
    setPickerTarget(null);
  };

  const handleTabPress = (label: string) => {
    if (label === '홈') {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* 검색 박스 */}
      <View style={styles.searchBox}>
        <TouchableOpacity
          style={styles.searchField}
          onPress={() => setPickerTarget('departure')}
        >
          <Text style={styles.searchLabel}>출발지</Text>
          <Text style={styles.searchValue}>{departure}</Text>
        </TouchableOpacity>

        <View style={styles.searchFieldDivider} />

        <TouchableOpacity
          style={styles.searchField}
          onPress={() => setPickerTarget('dest')}
        >
          <Text style={styles.searchLabel}>도착지</Text>
          <Text style={styles.searchValue}>{dest}</Text>
        </TouchableOpacity>
      </View>

      {/* 추천 섹션 헤더 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{departure} 출발 추천 특가 ✈️</Text>
        <Text style={styles.sectionCount}>{filteredRoutes.length}개 노선</Text>
      </View>

      {/* 노선 리스트 */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filteredRoutes.map((route) => (
          <RouteRow
            key={route.id}
            route={route}
            expanded={expandedId === route.id}
            onToggle={() =>
              setExpandedId((prev) => (prev === route.id ? null : route.id))
            }
          />
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 선택 모달 */}
      <Modal
        visible={pickerTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerTarget(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerTarget(null)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {pickerTarget === 'departure' ? '출발지 선택' : '도착지 선택'}
            </Text>
            <ScrollView>
              {pickerOptions.map((option) => {
                const isSelected =
                  pickerTarget === 'departure'
                    ? option === departure
                    : option === dest;
                return (
                  <TouchableOpacity
                    key={option}
                    style={styles.pickerOption}
                    onPress={() => handlePickerSelect(option)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        isSelected && styles.pickerOptionTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <Text style={styles.pickerCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 탭바 */}
      <View style={styles.tabbar}>
        {[
          { label: '홈', active: false },
          { label: '비교', active: true },
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

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // 검색 박스
  searchBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  searchField: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  searchFieldDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  searchLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  searchValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // 섹션 헤더
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // 노선 리스트
  scroll: { flex: 1 },

  // 노선 행
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  routeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeFlag: { fontSize: 28 },
  routeDest: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  routeCountry: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  routeRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  routeMinPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  routeChevron: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },

  // 이벤트 아코디언
  eventsContainer: {
    backgroundColor: COLORS.eventBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventAirline: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ddayBadge: {
    backgroundColor: COLORS.dday,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ddayUrgent: { backgroundColor: '#FFF0F0' },
  ddayText: {
    fontSize: 10,
    color: COLORS.ddayText,
    fontWeight: '500',
  },
  ddayTextUrgent: { color: COLORS.urgent },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  eventPeriod: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  eventPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // 선택 모달 (바텀 시트)
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  pickerOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  pickerOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  pickerCheck: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
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
