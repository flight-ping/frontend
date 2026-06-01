import { createRoute } from '@granite-js/react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchDepartureAirports, fetchDestinations, type AirportItem } from '../api/airports';
import { fetchRouteDeals, type DealItem } from '../api/deals';

export const Route = createRoute('/compare', {
  component: Page,
  screenOptions: { animation: 'none' },
});

// 타입

type AirportOption = {
  code: string;
  city: string;
  flag: string;
  isoCode: string;
  countryName: string;
  continent: string;
};

type TripType = 'oneway' | 'roundtrip';
type PickerTarget = 'departure' | 'dest' | 'date' | 'date-return';

// 날짜 유틸

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getDateList(count: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateLabel(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = DAY_LABELS[date.getDay() ?? 0] ?? '';
  return `${m}월 ${d}일 (${day})`;
}

function formatDateApi(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const DATE_LIST = getDateList(60);

// 상수

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

const DEPARTURE_ORDER = ['ICN', 'GMP', 'PUS', 'CJJ', 'TAE', 'CJU'];

function toOption(a: AirportItem): AirportOption {
  return {
    code: a.code,
    city: a.city,
    flag: a.flag,
    isoCode: a.isoCode,
    countryName: a.countryName,
    continent: a.continent,
  };
}

// 캘린더 컴포넌트

function CalendarPicker({
  selectedDate,
  onSelect,
  minDate,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const effectiveMin = minDate ?? today;

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 365);

  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const maxYear = maxDate.getFullYear();
  const maxMonth = maxDate.getMonth();

  const minYear = effectiveMin.getFullYear();
  const minMonth = effectiveMin.getMonth();

  const canGoPrev =
    viewYear > minYear || (viewYear === minYear && viewMonth > minMonth);
  const canGoNext =
    viewYear < maxYear || (viewYear === maxYear && viewMonth < maxMonth);

  const goPrev = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else { setViewMonth((m) => m - 1); }
  };


  const goNext = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else { setViewMonth((m) => m + 1); }
  };

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <View style={cal.root}>
      <View style={cal.monthNav}>
        <TouchableOpacity onPress={goPrev} disabled={!canGoPrev} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[cal.navArrow, !canGoPrev && cal.navArrowDisabled]}>‹</Text>
        </TouchableOpacity>
        <Text style={cal.monthLabel}>{viewYear}년 {viewMonth + 1}월</Text>
        <TouchableOpacity onPress={goNext} disabled={!canGoNext} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[cal.navArrow, !canGoNext && cal.navArrowDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={cal.weekRow}>
        {DAY_LABELS.map((d, i) => (
          <Text key={d} style={[cal.dayHeader, i === 0 && cal.sundayText, i === 6 && cal.saturdayText]}>{d}</Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={cal.weekRow}>
          {week.map((day, di) => {
            if (day === null) return <View key={di} style={cal.dayCell} />;
            const cellDate = new Date(viewYear, viewMonth, day);
            cellDate.setHours(0, 0, 0, 0);
            const isPast = cellDate < effectiveMin;
            const isTooFar = cellDate > maxDate;
            const isDisabled = isPast || isTooFar;
            const isToday = cellDate.getTime() === today.getTime();
            const isSelected = formatDateApi(cellDate) === formatDateApi(selectedDate);
            const isSunday = di === 0;
            const isSaturday = di === 6;
            return (
              <TouchableOpacity
                key={di}
                style={cal.dayCell}
                onPress={() => { if (!isDisabled) onSelect(cellDate); }}
                disabled={isDisabled}
                activeOpacity={0.7}
              >
                <View style={[cal.dayCellInner, isSelected && cal.dayCellSelected, isToday && !isSelected && cal.dayCellToday]}>
                  <Text style={[
                    cal.dayNum,
                    isDisabled && cal.dayNumDisabled,
                    isSelected && cal.dayNumSelected,
                    !isDisabled && isSunday && cal.sundayText,
                    !isDisabled && isSaturday && cal.saturdayText,
                  ]}>
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// 특가 카드

function DealCard({ deal, onPress }: { deal: DealItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.dealCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.dealCardHeader}>
        <Text style={styles.dealAirline}>{deal.airline}</Text>
        <View style={[styles.ddayBadge, deal.urgent && styles.ddayUrgent]}>
          <Text style={[styles.ddayText, deal.urgent && styles.ddayTextUrgent]}>{deal.dday}</Text>
        </View>
      </View>
      <Text style={styles.dealTitle}>{deal.title}</Text>
      <Text style={styles.dealPeriod}>판매 종료 {deal.dday}</Text>
      <Text style={styles.dealPrice}>{deal.priceText}</Text>
    </TouchableOpacity>
  );
}

// 페이지

function Page() {
  const navigation = Route.useNavigation();

  const [departureAirports, setDepartureAirports] = useState<AirportItem[]>([]);
  const [destinations, setDestinations] = useState<AirportOption[]>([]);
  const [departure, setDeparture] = useState<AirportOption | null>(null);
  const [dest, setDest] = useState<AirportOption | null>(null);
  const [routeDeals, setRouteDeals] = useState<DealItem[]>([]);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [tripType, setTripType] = useState<TripType>('roundtrip');
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(DATE_LIST[0] ?? new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchDepartureAirports().then(setDepartureAirports).catch(console.error);
  }, []);

  useEffect(() => {
    if (departure && dest) {
      fetchRouteDeals(departure.city, dest.city).then(setRouteDeals).catch(console.error);
    } else {
      setRouteDeals([]);
    }
  }, [departure, dest]);

  const koreanAirports: AirportOption[] = [
    ...DEPARTURE_ORDER
      .map((code) => departureAirports.find((a) => a.code === code))
      .filter((a): a is AirportItem => a !== undefined)
      .map(toOption),
    ...departureAirports.filter((a) => !DEPARTURE_ORDER.includes(a.code)).map(toOption),
  ];

  const destGrouped = useMemo(() => {
    const raw = destinations.reduce<Record<string, Record<string, AirportOption[]>>>(
      (acc, a) => {
        const cont = a.continent || '기타';
        acc[cont] ??= {};
        (acc[cont][a.isoCode] ??= []).push(a);
        return acc;
      },
      {}
    );
    return Object.fromEntries(Object.entries(raw).sort(([a]) => (a === '국내' ? -1 : 1)));
  }, [destinations]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleDepartureSelect = (option: AirportOption) => {
    setDeparture(option);
    setDest(null);
    setRouteDeals([]);
    setDestinations([]);
    fetchDestinations(option.code).then((list) => setDestinations(list.map(toOption))).catch(console.error);
    setPickerTarget(null);
    setSelectedContinent(null);
    setSelectedCountry(null);
  };

  const handleDestSelect = (option: AirportOption) => {
    setDest(option);
    setPickerTarget(null);
  };

  const handleOpenDest = () => {
    if (!departure) { showToast('출발지를 먼저 선택해주세요.'); return; }
    setSelectedContinent(null);
    setSelectedCountry(null);
    setPickerTarget('dest');
  };

  const handleFlightSearch = () => {
    if (!departure || !dest) { showToast('출발지와 도착지를 선택해주세요.'); return; }
    if (tripType === 'roundtrip' && !returnDate) { showToast('귀국일을 선택해주세요.'); return; }
    navigation.navigate('/flights', {
      departure: departure.code,
      destination: dest.code,
      date: formatDateApi(selectedDate),
      returnDate: returnDate ? formatDateApi(returnDate) : '',
      tripType,
      departureCity: departure.city,
      destCity: dest.city,
    });
  };

  const handleTabPress = (label: string) => {
    if (label === '홈') navigation.popToTop();
    if (label === '찜') navigation.navigate('/saved');
    if (label === '마이') navigation.navigate('/my');
  };

  return (
    <View style={styles.container}>
      {/* 검색 박스 */}
      <View style={styles.searchBox}>
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.searchField} onPress={() => setPickerTarget('departure')}>
            <Text style={styles.searchLabel}>출발지</Text>
            <Text style={[styles.searchValue, !departure && styles.searchPlaceholder]}>
              {departure?.city ?? '선택'}
            </Text>
          </TouchableOpacity>

          <View style={styles.searchFieldDivider} />

          <TouchableOpacity style={styles.searchField} onPress={handleOpenDest}>
            <Text style={styles.searchLabel}>도착지</Text>
            <Text style={[styles.searchValue, !dest && styles.searchPlaceholder]}>
              {dest?.city ?? '선택'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchDividerH} />

        {/* 편도/왕복 토글 */}
        <View style={styles.tripTypeRow}>
          {(['oneway', 'roundtrip'] as TripType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.tripTypeBtn, tripType === type && styles.tripTypeBtnActive]}
              onPress={() => {
                setTripType(type);
                if (type === 'oneway') setReturnDate(null);
              }}
            >
              <Text style={[styles.tripTypeText, tripType === type && styles.tripTypeTextActive]}>
                {type === 'oneway' ? '편도' : '왕복'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchDividerH} />

        {/* 날짜 */}
        {tripType === 'oneway' ? (
          <TouchableOpacity style={styles.dateField} onPress={() => setPickerTarget('date')}>
            <Text style={styles.searchLabel}>날짜</Text>
            <Text style={styles.searchValue}>{formatDateLabel(selectedDate)}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.searchRow}>
            <TouchableOpacity style={styles.searchField} onPress={() => setPickerTarget('date')}>
              <Text style={styles.searchLabel}>출발일</Text>
              <Text style={styles.searchValue}>{formatDateLabel(selectedDate)}</Text>
            </TouchableOpacity>
            <View style={styles.searchFieldDivider} />
            <TouchableOpacity style={styles.searchField} onPress={() => setPickerTarget('date-return')}>
              <Text style={styles.searchLabel}>귀국일</Text>
              <Text style={[styles.searchValue, !returnDate && styles.searchPlaceholder]}>
                {returnDate ? formatDateLabel(returnDate) : '선택'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.searchBtn} onPress={handleFlightSearch}>
          <Text style={styles.searchBtnText}>항공편 찾기</Text>
        </TouchableOpacity>
      </View>

      {/* 특가 목록 */}
      <View style={{ flex: 1 }}>
      {departure && dest ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {departure.city} → {dest.city} 특가 ✈️
            </Text>
            <Text style={styles.sectionCount}>{routeDeals.length}개</Text>
          </View>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {routeDeals.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>✈️</Text>
                <Text style={styles.emptyText}>해당 노선의 진행 중인 특가가 없어요</Text>
              </View>
            ) : (
              routeDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onPress={() => navigation.navigate('/deal-detail', { dealId: deal.id })}
                />
              ))
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyText}>출발지와 도착지를 선택하면{'\n'}해당 노선의 특가를 볼 수 있어요</Text>
        </View>
      )}
      </View>

      {/* 출발지 선택 모달 */}
      <Modal
        visible={pickerTarget === 'departure'}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPickerTarget(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>출발지 선택</Text>
            <ScrollView>
              {koreanAirports.map((option) => (
                <Pressable
                  key={option.code}
                  style={({ pressed }) => [styles.airportRow, pressed && styles.selectedRow]}
                  onPress={() => handleDepartureSelect(option)}
                >
                  <Text style={[styles.airportText, departure?.code === option.code && styles.selectedText]}>
                    {option.city}
                  </Text>
                  {departure?.code === option.code && <Text style={styles.checkIcon}>✓</Text>}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 도착지 선택 모달 (3단 패널) */}
      <Modal
        visible={pickerTarget === 'dest'}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPickerTarget(null)} />
          <View style={styles.destModalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{departure?.city ?? ''} → 도착지 선택</Text>
            <View style={styles.panelContainer}>
              {/* 대륙 */}
              <ScrollView style={styles.panel} showsVerticalScrollIndicator={true}>
                {Object.keys(destGrouped).map((continent) => (
                  <Pressable
                    key={continent}
                    style={({ pressed }) => [styles.panelRow, (pressed || selectedContinent === continent) && styles.selectedRow]}
                    onPress={() => { setSelectedContinent(continent); setSelectedCountry(null); }}
                  >
                    <Text style={[styles.panelText, selectedContinent === continent && styles.selectedText]}>
                      {continent}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* 나라 */}
              <ScrollView style={[styles.panel, styles.panelBorder]} showsVerticalScrollIndicator={true}>
                {Object.entries(destGrouped[selectedContinent ?? ''] ?? {}).map(([isoCode, airports]) => (
                  <Pressable
                    key={isoCode}
                    style={({ pressed }) => [styles.panelRow, (pressed || selectedCountry === isoCode) && styles.selectedRow]}
                    onPress={() => setSelectedCountry(isoCode)}
                  >
                    <Text style={[styles.panelText, selectedCountry === isoCode && styles.selectedText]}>
                      {airports[0]?.countryName || isoCode}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* 공항 */}
              <ScrollView style={[styles.panel, styles.panelBorder]} showsVerticalScrollIndicator={true}>
                {(destGrouped[selectedContinent ?? '']?.[selectedCountry ?? ''] ?? []).map((option) => (
                  <TouchableOpacity
                    key={option.code}
                    style={styles.panelRow}
                    onPress={() => handleDestSelect(option)}
                  >
                    <Text style={[styles.panelText, dest?.code === option.code && styles.selectedText]}>
                      {option.city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* 출발일 선택 모달 */}
      <Modal
        visible={pickerTarget === 'date'}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPickerTarget(null)} />
          <View style={styles.calModalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{tripType === 'roundtrip' ? '출발일 선택' : '날짜 선택'}</Text>
            <CalendarPicker
              selectedDate={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                if (returnDate && date >= returnDate) setReturnDate(null);
                setPickerTarget(null);
              }}
            />
            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>

      {/* 귀국일 선택 모달 */}
      <Modal
        visible={pickerTarget === 'date-return'}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPickerTarget(null)} />
          <View style={styles.calModalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>귀국일 선택</Text>
            <CalendarPicker
              selectedDate={returnDate ?? selectedDate}
              minDate={selectedDate}
              onSelect={(date) => { setReturnDate(date); setPickerTarget(null); }}
            />
            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>

      {/* 토스트 */}
      <Animated.View
        pointerEvents="none"
        style={[styles.toast, {
          opacity: toastAnim,
          transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        }]}
      >
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>

      {/* 탭바 */}
      <View style={styles.tabbar}>
        {[
          { label: '홈', active: false },
          { label: '비교', active: true },
          { label: '찜', active: false },
          { label: '마이', active: false },
        ].map((tab) => (
          <TouchableOpacity key={tab.label} style={styles.tab} onPress={() => handleTabPress(tab.label)}>
            <Text style={[styles.tabLabel, tab.active && styles.tabActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// 스타일

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // 검색 박스
  searchBox: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  searchRow: { flexDirection: 'row' },
  searchField: { flex: 1, paddingVertical: 14, paddingHorizontal: 16 },
  searchFieldDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  searchDividerH: { height: 1, backgroundColor: COLORS.border },
  dateField: { paddingVertical: 14, paddingHorizontal: 16 },
  searchLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  searchValue: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  searchPlaceholder: { color: COLORS.textSecondary, fontWeight: '400' },

  // 편도/왕복 토글
  tripTypeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tripTypeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tripTypeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tripTypeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tripTypeTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    margin: 12,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },

  // 섹션 헤더
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  sectionCount: { fontSize: 12, color: COLORS.textSecondary },

  scroll: { flex: 1 },

  // 특가 카드
  dealCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  dealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dealAirline: { fontSize: 12, color: COLORS.textSecondary },
  ddayBadge: {
    backgroundColor: COLORS.dday,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ddayUrgent: { backgroundColor: '#FFF0F0' },
  ddayText: { fontSize: 10, color: COLORS.ddayText, fontWeight: '500' },
  ddayTextUrgent: { color: COLORS.urgent },
  dealTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  dealPeriod: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 },
  dealPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  // 빈 상태
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  // 모달 공통
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalHandle: {
    width: 36, height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16, fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  // 출발지 모달
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  airportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  airportText: { fontSize: 15, color: COLORS.textPrimary },
  checkIcon: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },

  // 도착지 3단 패널 모달
  destModalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    height: '70%',
  },
  panelContainer: { flexDirection: 'row', flex: 1 },
  panel: { flex: 1, backgroundColor: COLORS.white },
  panelBorder: { borderLeftWidth: 0.5, borderLeftColor: COLORS.border },
  panelRow: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  panelText: { fontSize: 13, color: COLORS.textPrimary },
  selectedRow: { backgroundColor: '#EEF4FF' },
  selectedText: { color: COLORS.primary, fontWeight: '600' },

  // 캘린더 모달
  calModalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },

  // 토스트
  toast: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: { color: '#FFFFFF', fontSize: 13 },

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

// 캘린더 스타일

const CELL_SIZE = 40;

const cal = StyleSheet.create({
  root: { paddingHorizontal: 16, paddingTop: 4 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  navArrow: { fontSize: 26, fontWeight: '300', color: COLORS.textPrimary, paddingHorizontal: 8 },
  navArrowDisabled: { color: COLORS.border },
  monthLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  dayHeader: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    paddingVertical: 4,
  },
  dayCell: { width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center' },
  dayCellInner: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dayCellSelected: { backgroundColor: COLORS.primary },
  dayCellToday: { borderWidth: 1.5, borderColor: COLORS.primary },
  dayNum: { fontSize: 14, color: COLORS.textPrimary },
  dayNumDisabled: { color: COLORS.border },
  dayNumSelected: { color: COLORS.white, fontWeight: '700' },
  sundayText: { color: '#FF5252' },
  saturdayText: { color: COLORS.primary },
});
