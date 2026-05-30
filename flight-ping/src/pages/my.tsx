import { createRoute } from '@granite-js/react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchAirports, fetchDepartureAirports, fetchDestinations, type AirportItem } from '../api/airports';
import {
  addInterestedRoute,
  deleteInterestedRoute,
  fetchInterestedRoutes,
  type InterestedRouteItem,
} from '../api/interested-routes';

export const Route = createRoute('/my', {
  component: Page,
  screenOptions: { animation: 'none' },
});

// 타입

type AddStep = 'departure' | 'dest';

type NotificationSettings = {
  dealAlert: boolean;
  urgentAlert: boolean;
};

type AirportOption = {
  code: string;
  city: string;
  flag: string;
  isoCode: string;
  countryName: string;
  continent: string;
};

// 상수

const COLORS = {
  primary: '#2979FF',
  background: '#F5F6FA',
  white: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#888888',
  border: '#EEEEEE',
  overlay: 'rgba(0,0,0,0.4)',
};

// 컴포넌트

function RouteItem({
  route,
  onRemove,
  airportMap,
}: {
  route: InterestedRouteItem;
  onRemove: (id: number) => void;
  airportMap: Record<string, AirportOption>;
}) {
  const destAirport = airportMap[route.dest];
  const depCity = airportMap[route.departure]?.city ?? route.departure;
  const destCity = destAirport?.city ?? route.dest;
  const flag = destAirport?.flag ?? '✈️';
  return (
    <View style={styles.routeItem}>
      <Text style={styles.routeFlag}>{flag}</Text>
      <Text style={styles.routeItemText}>
        {depCity} → {destCity}
      </Text>
      <TouchableOpacity
        onPress={() => onRemove(route.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.removeIcon}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

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

function Page() {
  const navigation = Route.useNavigation();
  const [airports, setAirports] = useState<AirportItem[]>([]);
  const [departureAirports, setDepartureAirports] = useState<AirportItem[]>([]);
  const [destinations, setDestinations] = useState<AirportOption[]>([]);
  const [interestedRoutes, setInterestedRoutes] = useState<InterestedRouteItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    dealAlert: true,
    urgentAlert: true,
  });
  const [addStep, setAddStep] = useState<AddStep | null>(null);
  const [pendingDeparture, setPendingDeparture] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const translateY = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const prevAddStepRef = useRef<AddStep | null>(null);
  const closeModalRef = useRef<() => void>(() => {});
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          translateY.setValue(gs.dy);
          overlayOpacity.setValue(Math.max(0, 1 - gs.dy / 500));
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 100) {
          Animated.parallel([
            Animated.timing(translateY, { toValue: 700, duration: 220, useNativeDriver: true }),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
          ]).start(() => {
            closeModalRef.current();
          });
        } else {
          Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            Animated.timing(overlayOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    fetchAirports().then(setAirports).catch(console.error);
    fetchDepartureAirports().then(setDepartureAirports).catch(console.error);
    fetchInterestedRoutes().then(setInterestedRoutes).catch(console.error);
  }, []);

  useEffect(() => {
    if (addStep !== null && prevAddStepRef.current === null) {
      translateY.setValue(600);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
    prevAddStepRef.current = addStep;
  }, [addStep]);

  const airportMap: Record<string, AirportOption> = Object.fromEntries(
    airports.map((a) => [a.code, toOption(a)])
  );

  const DEPARTURE_ORDER = ['ICN', 'GMP', 'PUS', 'CJJ', 'TAE', 'CJU'];
  const koreanAirports: AirportOption[] = [
    ...DEPARTURE_ORDER.map((code) => departureAirports.find((a) => a.code === code)).filter((a): a is AirportItem => a !== undefined).map(toOption),
    ...departureAirports.filter((a) => !DEPARTURE_ORDER.includes(a.code)).map(toOption),
  ];

  // 도착지: 대륙 → { isoCode → AirportOption[] }, 국내 최상단
  const destGroupedRaw = destinations.reduce<Record<string, Record<string, AirportOption[]>>>(
    (acc, a) => {
      const cont = a.continent || '기타';
      acc[cont] ??= {};
      (acc[cont][a.isoCode] ??= []).push(a);
      return acc;
    },
    {}
  );
  const destGrouped = Object.fromEntries(
    Object.entries(destGroupedRaw).sort(([a]) => (a === '국내' ? -1 : 1))
  );

  const depCityLabel = pendingDeparture ? (airportMap[pendingDeparture]?.city ?? pendingDeparture) : '';
  const modalTitle =
    addStep === 'departure' ? '출발지 선택' : `${depCityLabel} → 도착지 선택`;

  const handleContinentPress = (continent: string) => {
    setSelectedContinent(continent);
    setSelectedCountry(null);
  };

  const handleCountryPress = (isoCode: string) => {
    setSelectedCountry(isoCode);
  };

  const handleModalSelect = (option: AirportOption) => {
    if (addStep === 'departure') {
      setPendingDeparture(option.code);
      fetchDestinations(option.code)
        .then((list) => setDestinations(list.map(toOption)))
        .catch(console.error);
      setSelectedContinent(null);
      setSelectedCountry(null);
      setAddStep('dest');
    } else {
      if (pendingDeparture !== null) {
        addInterestedRoute(pendingDeparture, option.code)
          .then((created) => {
            setInterestedRoutes((prev) => [...prev, created]);
          })
          .catch(console.error);
      }
      setPendingDeparture(null);
      setDestinations([]);
      setAddStep(null);
    }
  };

  const handleModalClose = () => {
    setAddStep(null);
    setPendingDeparture(null);
    setDestinations([]);
    setSelectedContinent(null);
    setSelectedCountry(null);
  };
  closeModalRef.current = handleModalClose;

  const handleRemoveRoute = (id: number) => {
    Alert.alert('노선 삭제', '관심 노선을 삭제하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteInterestedRoute(id)
            .then(() => {
              setInterestedRoutes((prev) => prev.filter((r) => r.id !== id));
            })
            .catch(console.error);
        },
      },
    ]);
  };

  const handleTabPress = (label: string) => {
    if (label === '홈') navigation.popToTop();
    if (label === '비교') navigation.navigate('/compare');
    if (label === '찜') navigation.navigate('/saved');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={true}>
        {/* 관심 노선 섹션 */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>관심 노선</Text>
        </View>
        <View style={styles.section}>
          {interestedRoutes.length === 0 && (
            <Text style={styles.emptyText}>등록된 관심 노선이 없어요</Text>
          )}
          {interestedRoutes.map((route, index) => (
            <React.Fragment key={route.id}>
              {index > 0 && <View style={styles.divider} />}
              <RouteItem route={route} onRemove={handleRemoveRoute} airportMap={airportMap} />
            </React.Fragment>
          ))}
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setAddStep('departure')}
          >
            <Text style={styles.addBtnText}>+ 노선 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 알림 설정 섹션 */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>알림 설정</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>특가 알림</Text>
              <Text style={styles.settingDesc}>새로운 특가 이벤트를 알려드려요</Text>
            </View>
            <Switch
              value={notifications.dealAlert}
              onValueChange={(v) =>
                setNotifications({
                  dealAlert: v,
                  urgentAlert: v ? notifications.urgentAlert : false,
                })
              }
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={[styles.settingRow, !notifications.dealAlert && styles.disabled]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>마감 임박 알림</Text>
              <Text style={styles.settingDesc}>판매 종료 D-3 이내 이벤트를 알려드려요</Text>
            </View>
            <Switch
              value={notifications.urgentAlert && notifications.dealAlert}
              onValueChange={(v) =>
                setNotifications((prev) => ({ ...prev, urgentAlert: v }))
              }
              disabled={!notifications.dealAlert}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 노선 추가 모달 */}
      <Modal
        visible={addStep !== null}
        transparent
        animationType="none"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.overlay, opacity: overlayOpacity }]}
            pointerEvents="none"
          />
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleModalClose} />
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY }] }]}>
            <View style={styles.modalDragArea} {...panResponder.panHandlers}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{modalTitle}</Text>
            </View>
            {addStep === 'departure' ? (
              // 출발지: 공항 목록
              <ScrollView style={{ flex: 1 }}>
                {koreanAirports.map((option) => (
                  <Pressable
                    key={option.code}
                    style={({ pressed }) => [styles.airportRow, pressed && styles.selectedRow]}
                    onPress={() => handleModalSelect(option)}
                  >
                    <Text style={styles.airportText}>{option.city}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              // 도착지: 대륙 | 나라 | 공항 3단 패널
              <View style={styles.panelContainer}>
                {/* 대륙 */}
                <ScrollView style={styles.panel} showsVerticalScrollIndicator={true}>
                  {Object.keys(destGrouped).map((continent) => (
                    <Pressable
                      key={continent}
                      style={({ pressed }) => [
                        styles.panelRow,
                        (pressed || selectedContinent === continent) && styles.selectedRow,
                      ]}
                      onPress={() => handleContinentPress(continent)}
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
                      style={({ pressed }) => [
                        styles.panelRow,
                        (pressed || selectedCountry === isoCode) && styles.selectedRow,
                      ]}
                      onPress={() => handleCountryPress(isoCode)}
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
                      onPress={() => handleModalSelect(option)}
                    >
                      <Text style={styles.panelText}>{option.city}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* 탭바 */}
      <View style={styles.tabbar}>
        {[
          { label: '홈', active: false },
          { label: '비교', active: false },
          { label: '찜', active: false },
          { label: '마이', active: true },
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

  // 섹션
  sectionLabel: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },

  // 관심 노선
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  routeFlag: { fontSize: 20 },
  routeItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  removeIcon: {
    fontSize: 22,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // 알림 설정
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingInfo: { flex: 1, marginRight: 16 },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  settingDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  disabled: { opacity: 0.4 },

  // 노선 추가 모달
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    height: '70%',
  },
  modalDragArea: {
    paddingTop: 12,
    paddingBottom: 8,
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

  // 3단 패널
  panelContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  panel: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  panelBorder: {
    borderLeftWidth: 0.5,
    borderLeftColor: COLORS.border,
  },
  panelRow: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  panelText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  selectedRow: {
    backgroundColor: '#EEF4FF',
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  continentRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  continentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  airportRow: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  airportText: {
    fontSize: 14,
    color: COLORS.textPrimary,
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
