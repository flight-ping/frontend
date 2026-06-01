import { createRoute } from '@granite-js/react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchFlights, type FlightResult } from '../api/flights';

export const Route = createRoute('/flights', {
  component: Page,
  validateParams: (params): {
    departure: string;
    destination: string;
    date: string;
    returnDate: string;
    tripType: string;
    departureCity: string;
    destCity: string;
  } => {
    const p = params as Record<string, unknown>;
    return {
      departure: String(p?.departure ?? ''),
      destination: String(p?.destination ?? ''),
      date: String(p?.date ?? ''),
      returnDate: String(p?.returnDate ?? ''),
      tripType: String(p?.tripType ?? 'oneway'),
      departureCity: String(p?.departureCity ?? ''),
      destCity: String(p?.destCity ?? ''),
    };
  },
});

// 타입

type SortKey = 'price' | 'departure' | 'arrival';
type FlightTab = 'outbound' | 'return';

// 상수

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

const IATA_TO_URL: Record<string, string> = {
  KE: 'https://www.koreanair.com',
  OZ: 'https://flyasiana.com',
  '7C': 'https://www.jejuair.net',
  LJ: 'https://www.jinair.com',
  TW: 'https://www.twayair.com',
  RS: 'https://www.airseoul.com',
  BX: 'https://www.airbusan.com',
  YP: 'https://www.airpremia.com',
  ZE: 'https://www.eastarjet.com',
  WE: 'https://www.flyparata.com',
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'price', label: '최저가순' },
  { key: 'departure', label: '출발시간순' },
  { key: 'arrival', label: '도착시간순' },
];

// 유틸

function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null || minutes <= 0) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function normalizeIata(code: string | null | undefined): string {
  return (code ?? '').replace(/^_/, '');
}

function getLogoUrl(code: string): string {
  const iata = normalizeIata(code);
  return `https://www.gstatic.com/flights/airline_logos/70px/${iata}.png`;
}

function parseTime(datetime: string): string {
  if (!datetime) return '';
  return datetime.match(/T(\d{2}:\d{2})/)?.[1] ?? datetime;
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${Number(m)}월 ${Number(d)}일 (${days[date.getDay()]})`;
}

function getDayOffset(departureTime: string, durationMinutes: number | null | undefined): number {
  if (!departureTime || !durationMinutes || durationMinutes <= 0) return 0;
  const parts = departureTime.split(':').map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  if (isNaN(h) || isNaN(m)) return 0;
  return Math.floor((h * 60 + m + durationMinutes) / 1440);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDateChip(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${Number(m)}/${Number(d)}(${days[date.getDay()]})`;
}

function flightKey(flight: FlightResult): string {
  const leg = flight.legs[0];
  return `${leg?.airline}-${leg?.flightNumber}-${leg?.departure}`;
}

// 컴포넌트

function DateBar({
  selectedDate,
  minDate,
  maxDate,
  onSelect,
}: {
  selectedDate: string;
  minDate?: string;
  maxDate?: string;
  onSelect: (date: string) => void;
}) {
  const dates: string[] = [];
  for (let i = -3; i <= 10; i++) {
    dates.push(addDays(selectedDate, i));
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.dateBar}
      contentContainerStyle={styles.dateBarContent}
    >
      {dates.map(d => {
        const isSelected = d === selectedDate;
        const isDisabled = (minDate != null && d < minDate) || (maxDate != null && d > maxDate);
        return (
          <TouchableOpacity
            key={d}
            style={[styles.dateChip, isSelected && styles.dateChipSelected, isDisabled && styles.dateChipDisabled]}
            onPress={() => onSelect(d)}
            disabled={isDisabled}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
              {formatDateChip(d)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function FlightCard({
  flight,
  isSelected,
  onPress,
}: {
  flight: FlightResult;
  isSelected: boolean;
  onPress: () => void;
}) {
  const leg = flight.legs[0];
  if (!leg) return null;

  const logoUrl = getLogoUrl(leg.airline);
  const airlineName = leg.airlineName || leg.airline;

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* 항공사 + 편명 | 직항/경유 */}
      <View style={styles.cardTop}>
        <View style={styles.airlineRow}>
          <Image source={{ uri: logoUrl }} style={styles.airlineLogo} resizeMode="contain" />
          <Text style={styles.airlineName}>{airlineName}</Text>
          <Text style={styles.flightNo}>{leg.flightNumber}</Text>
        </View>
        <View style={styles.stopsBadge}>
          <Text style={styles.stopsBadgeText}>
            {(flight.stops ?? 0) === 0 ? '직항' : `경유 ${flight.stops}`}
          </Text>
        </View>
      </View>

      {/* 시간 — 가로 꽉 채움 */}
      <View style={styles.timeSection}>
        <Text style={styles.time}>{parseTime(leg.departure)}</Text>
        <View style={styles.durationRow}>
          {getDayOffset(parseTime(leg.departure), flight.duration) > 0 && (
            <Text style={styles.dayOffset}>
              (+{getDayOffset(parseTime(leg.departure), flight.duration)})
            </Text>
          )}
          <View style={styles.durationLine} />
          <Text style={styles.durationText}>{formatDuration(flight.duration)}</Text>
          <View style={styles.durationLine} />
        </View>
        <Text style={styles.time}>{parseTime(leg.arrival)}</Text>
      </View>

      {/* 가격 */}
      <Text style={styles.price}>
        {flight.price != null ? `${flight.price.toLocaleString()}원~` : '-'}
      </Text>
    </TouchableOpacity>
  );
}

function SelectedPanelRow({
  label,
  flight,
}: {
  label: string;
  flight: FlightResult;
}) {
  const leg = flight.legs[0];
  const iata = normalizeIata(leg?.airline ?? '');

  return (
    <View style={styles.panelRow}>
      <View style={styles.panelRowLeft}>
        <View style={styles.panelLabelRow}>
          <Text style={styles.panelLabel}>{label}</Text>
          <Text style={styles.panelLabelPrice}>
            {flight.price != null ? `${flight.price.toLocaleString()}원~` : '-'}
          </Text>
        </View>
        <View style={styles.panelFlightLine}>
          <Image
            source={{ uri: getLogoUrl(leg?.airline ?? '') }}
            style={styles.panelLogo}
            resizeMode="contain"
          />
          <Text style={styles.panelAirline} numberOfLines={1}>
            {leg?.airlineName || leg?.airline}
          </Text>
          <Text style={styles.panelTime}>
            {parseTime(leg?.departure ?? '')} → {parseTime(leg?.arrival ?? '')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bookBtn}
        activeOpacity={0.85}
        onPress={() => Linking.openURL(IATA_TO_URL[iata] ?? 'https://www.google.com/travel/flights')}
      >
        <Text style={styles.bookBtnText}>예매하기</Text>
      </TouchableOpacity>
    </View>
  );
}

function SelectedPanel({
  outbound,
  ret,
  isRoundtrip,
}: {
  outbound: FlightResult | null;
  ret: FlightResult | null;
  isRoundtrip: boolean;
}) {
  if (!outbound && !ret) return null;

  const total = (outbound?.price ?? 0) + (ret?.price ?? 0);
  const showTotal = isRoundtrip ? (outbound != null && ret != null) : outbound != null;

  return (
    <View style={styles.panel}>
      {outbound && (
        <SelectedPanelRow
          label={isRoundtrip ? '가는 편' : '선택한 항공편'}
          flight={outbound}
        />
      )}
      {isRoundtrip && outbound && ret && <View style={styles.panelDivider} />}
      {isRoundtrip && ret && (
        <SelectedPanelRow label="오는 편" flight={ret} />
      )}
      {showTotal && (
        <>
          <View style={styles.panelTotalDivider} />
          <View style={styles.panelTotalRow}>
            <Text style={styles.panelTotalLabel}>총액</Text>
            <Text style={styles.panelTotalPrice}>{total.toLocaleString()}원~</Text>
          </View>
        </>
      )}
    </View>
  );
}

// 페이지

function Page() {
  const navigation = Route.useNavigation();
  const { departure, destination, date: initialDate, returnDate: initialReturnDate, tripType, departureCity, destCity } = Route.useParams();

  const isRoundtrip = tripType === 'roundtrip';

  const [flightTab, setFlightTab] = useState<FlightTab>('outbound');
  const [outboundFlights, setOutboundFlights] = useState<FlightResult[]>([]);
  const [returnFlights, setReturnFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('price');
  const [selectedOutbound, setSelectedOutbound] = useState<FlightResult | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<FlightResult | null>(null);
  const [directOnly, setDirectOnly] = useState(false);
  const [outboundDate, setOutboundDate] = useState(initialDate);
  const [retDate, setRetDate] = useState(initialReturnDate);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const sortBtnRef = useRef<any>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setSelectedOutbound(null);
    fetchFlights(departure, destination, outboundDate)
      .then(setOutboundFlights)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [departure, destination, outboundDate]);

  useEffect(() => {
    if (!isRoundtrip || !retDate) return;
    setSelectedReturn(null);
    fetchFlights(destination, departure, retDate)
      .then(setReturnFlights)
      .catch(console.error);
  }, [destination, departure, retDate, isRoundtrip]);

  function handleOutboundDateSelect(d: string) {
    setOutboundDate(d);
    setSelectionError(null);
  }

  function handleReturnDateSelect(d: string) {
    setRetDate(d);
    setSelectionError(null);
  }

  function handleFlightSelect(flight: FlightResult) {
    const leg = flight.legs[0];

    if (flightTab === 'outbound') {
      if (selectedReturn && outboundDate === retDate) {
        const outArrival = parseTime(leg?.arrival ?? '');
        const retDep = parseTime(selectedReturn.legs[0]?.departure ?? '');
        if (outArrival && retDep && outArrival >= retDep) {
          setSelectionError('가는 편 도착 후 오는 편이 출발하는 항공편을 선택해 주세요.');
          return;
        }
      }
      setSelectionError(null);
      setSelectedOutbound(flight);
    } else {
      if (selectedOutbound && outboundDate === retDate) {
        const outArrival = parseTime(selectedOutbound.legs[0]?.arrival ?? '');
        const retDep = parseTime(leg?.departure ?? '');
        if (outArrival && retDep && retDep <= outArrival) {
          setSelectionError('가는 편 도착 후 오는 편이 출발하는 항공편을 선택해 주세요.');
          return;
        }
      }
      setSelectionError(null);
      setSelectedReturn(flight);
    }
  }

  const currentFlights = flightTab === 'outbound' ? outboundFlights : returnFlights;

  const sorted = [...currentFlights].sort((a, b) => {
    if (sortBy === 'price') return (a.price ?? Infinity) - (b.price ?? Infinity);
    const aLeg = a.legs[0];
    const bLeg = b.legs[0];
    if (sortBy === 'departure') return parseTime(aLeg?.departure ?? '').localeCompare(parseTime(bLeg?.departure ?? ''));
    return parseTime(aLeg?.arrival ?? '').localeCompare(parseTime(bLeg?.arrival ?? ''));
  });

  const filtered = directOnly ? sorted.filter(f => (f.stops ?? 0) === 0) : sorted;

  const selectedOnCurrentTab = flightTab === 'outbound' ? selectedOutbound : selectedReturn;

  const headerDate = isRoundtrip
    ? `${formatDateShort(outboundDate)} ~ ${formatDateShort(retDate)} · 왕복`
    : `${formatDateShort(outboundDate)} · 편도`;

  const hasPanel = selectedOutbound != null || selectedReturn != null;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerRoute}>{departureCity} {isRoundtrip ? '↔' : '→'} {destCity}</Text>
          <Text style={styles.headerDate}>{headerDate}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* 왕복 탭 */}
      {isRoundtrip && (
        <View style={styles.flightTabBar}>
          {([['outbound', '가는 편'], ['return', '오는 편']] as [FlightTab, string][]).map(([tab, label]) => {
            const hasSelection = tab === 'outbound' ? selectedOutbound != null : selectedReturn != null;
            return (
              <TouchableOpacity
                key={tab}
                style={styles.flightTab}
                onPress={() => { setFlightTab(tab); setSelectionError(null); }}
              >
                <View style={styles.flightTabInner}>
                  <Text style={[styles.flightTabText, flightTab === tab && styles.flightTabTextActive]}>
                    {label}
                  </Text>
                  {hasSelection && <View style={styles.flightTabDot} />}
                </View>
                {flightTab === tab && <View style={styles.flightTabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* 날짜 탭 */}
      {isRoundtrip ? (
        flightTab === 'outbound' ? (
          <DateBar
            selectedDate={outboundDate}
            maxDate={retDate || undefined}
            onSelect={handleOutboundDateSelect}
          />
        ) : (
          <DateBar
            selectedDate={retDate}
            minDate={outboundDate}
            onSelect={handleReturnDateSelect}
          />
        )
      ) : (
        <DateBar
          selectedDate={outboundDate}
          onSelect={handleOutboundDateSelect}
        />
      )}

      {/* 필터/정렬 바 */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setDirectOnly(v => !v)} activeOpacity={0.7}>
          <View style={[styles.checkbox, directOnly && styles.checkboxChecked]}>
            {directOnly && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>직항만</Text>
        </TouchableOpacity>
        <TouchableOpacity
          ref={sortBtnRef}
          style={styles.sortSelector}
          onPress={() => {
            sortBtnRef.current?.measureInWindow((_x: number, y: number, _w: number, h: number) => {
              setMenuTop(y + h + 4);
              setShowSortMenu(true);
            });
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.sortSelectorText}>
            {SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? '최저가순'}
          </Text>
          <Text style={styles.sortChevron}>∨</Text>
        </TouchableOpacity>
      </View>

      {/* 정렬 드롭다운 */}
      <Modal transparent visible={showSortMenu} animationType="fade" onRequestClose={() => setShowSortMenu(false)}>
        <TouchableOpacity style={styles.sortOverlay} activeOpacity={1} onPress={() => setShowSortMenu(false)}>
          <View style={[styles.sortMenu, { top: menuTop }]}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortMenuItem, sortBy === opt.key && styles.sortMenuItemActive]}
                onPress={() => { setSortBy(opt.key); setShowSortMenu(false); }}
              >
                <Text style={[styles.sortMenuItemText, sortBy === opt.key && styles.sortMenuItemTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 결과 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>{filtered.length}개 항공편</Text>
          {selectionError && (
            <View style={styles.selectionErrorBanner}>
              <Text style={styles.selectionErrorText}>⚠️ {selectionError}</Text>
            </View>
          )}
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>✈️</Text>
                <Text style={styles.emptyText}>조회된 항공편이 없어요</Text>
              </View>
            ) : (
              filtered.map((flight, idx) => (
                <FlightCard
                  key={idx}
                  flight={flight}
                  isSelected={
                    selectedOnCurrentTab != null &&
                    flightKey(flight) === flightKey(selectedOnCurrentTab)
                  }
                  onPress={() => handleFlightSelect(flight)}
                />
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* 선택 패널 */}
      {hasPanel && (
        <SelectedPanel
          outbound={selectedOutbound}
          ret={selectedReturn}
          isRoundtrip={isRoundtrip}
        />
      )}
    </View>
  );
}

// 스타일

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
  headerRoute: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  headerDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // 왕복 탭
  flightTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  flightTab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  flightTabInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flightTabText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  flightTabTextActive: { color: COLORS.primary, fontWeight: '700' },
  flightTabDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  flightTabUnderline: {
    position: 'absolute', bottom: 0, left: 16, right: 16,
    height: 2, backgroundColor: COLORS.primary, borderRadius: 1,
  },

  // 날짜 탭
  dateBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    flexGrow: 0,
    flexShrink: 0,
  },
  dateBarContent: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  dateChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateChipDisabled: {
    opacity: 0.3,
  },
  dateChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dateChipTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },

  // 필터/정렬 바
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkmark: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  checkboxLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  sortSelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortSelectorText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  sortChevron: { fontSize: 10, color: COLORS.textSecondary },

  // 정렬 드롭다운
  sortOverlay: { flex: 1 },
  sortMenu: {
    position: 'absolute',
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    minWidth: 120,
  },
  sortMenuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  sortMenuItemActive: { backgroundColor: COLORS.directBg },
  sortMenuItemText: { fontSize: 13, color: COLORS.textPrimary },
  sortMenuItemTextActive: { color: COLORS.primary, fontWeight: '600' },

  // 로딩/결과
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultCount: { fontSize: 12, color: COLORS.textSecondary, paddingHorizontal: 20, paddingVertical: 10 },
  selectionErrorBanner: {
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: '#FFF4E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FFCC80',
  },
  selectionErrorText: {
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
  scroll: { flex: 1 },

  // 빈 상태
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },

  // 항공편 카드
  card: {
    backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 10,
    borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: COLORS.border,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  airlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  airlineLogo: { width: 24, height: 24, borderRadius: 4 },
  airlineName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  flightNo: { fontSize: 12, color: COLORS.textSecondary },

  // 시간 — 가로 꽉 채움
  timeSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  time: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  durationRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dayOffset: {
    position: 'absolute',
    bottom: -14,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  durationLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  durationText: { fontSize: 10, color: COLORS.textSecondary },

  // 직항/경유 + 가격
  stopsBadge: { backgroundColor: COLORS.directBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  stopsBadgeText: { fontSize: 11, color: COLORS.directText, fontWeight: '500' },
  price: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginTop: 10, textAlign: 'right' },

  // 선택 패널
  panel: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  panelDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  panelRowLeft: {
    flex: 1,
    gap: 4,
  },
  panelLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  panelLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  panelLabelPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  panelFlightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  panelLogo: { width: 18, height: 18, borderRadius: 3 },
  panelAirline: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  panelTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  panelTotalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 10,
    marginBottom: 8,
  },
  panelTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  panelTotalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
