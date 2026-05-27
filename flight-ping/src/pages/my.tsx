import { createRoute } from '@granite-js/react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const Route = createRoute('/my', {
  component: Page,
  screenOptions: { animation: 'none' },
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

type AddStep = 'departure' | 'dest';

type InterestedRoute = {
  id: string;
  departure: Airport;
  dest: string;
  flag: string;
};

type NotificationSettings = {
  dealAlert: boolean;
  urgentAlert: boolean;
};

// ─── 더미 데이터 ──────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#2979FF',
  background: '#F5F6FA',
  white: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#888888',
  border: '#EEEEEE',
  overlay: 'rgba(0,0,0,0.4)',
};

const AIRPORTS: Airport[] = [
  '인천', '김포', '부산', '대구', '제주', '청주', '광주', '무안', '양양',
];

const DESTINATIONS = [
  '도쿄', '오사카', '후쿠오카', '삿포로',
  '방콕', '세부', '마닐라', '하노이', '다낭', '호치민',
  '싱가포르', '홍콩', '대만(타이베이)',
  '제주', '부산(김해)', '서울(김포)',
];

const DEST_FLAGS: Record<string, string> = {
  '도쿄': '🇯🇵',
  '오사카': '🇯🇵',
  '후쿠오카': '🇯🇵',
  '삿포로': '🇯🇵',
  '방콕': '🇹🇭',
  '세부': '🇵🇭',
  '마닐라': '🇵🇭',
  '하노이': '🇻🇳',
  '다낭': '🇻🇳',
  '호치민': '🇻🇳',
  '싱가포르': '🇸🇬',
  '홍콩': '🇭🇰',
  '대만(타이베이)': '🇹🇼',
  '제주': '🇰🇷',
  '부산(김해)': '🇰🇷',
  '서울(김포)': '🇰🇷',
};

const INITIAL_ROUTES: InterestedRoute[] = [
  { id: 'ir1', departure: '인천', dest: '도쿄', flag: '🇯🇵' },
  { id: 'ir2', departure: '인천', dest: '방콕', flag: '🇹🇭' },
];

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

function RouteItem({
  route,
  onRemove,
}: {
  route: InterestedRoute;
  onRemove: (id: string) => void;
}) {
  return (
    <View style={styles.routeItem}>
      <Text style={styles.routeFlag}>{route.flag}</Text>
      <Text style={styles.routeItemText}>
        {route.departure} → {route.dest}
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

function Page() {
  const navigation = Route.useNavigation();
  const [interestedRoutes, setInterestedRoutes] = useState<InterestedRoute[]>(INITIAL_ROUTES);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    dealAlert: true,
    urgentAlert: true,
  });
  const [addStep, setAddStep] = useState<AddStep | null>(null);
  const [pendingDeparture, setPendingDeparture] = useState<Airport | null>(null);

  const modalOptions: string[] = addStep === 'departure' ? AIRPORTS : DESTINATIONS;
  const modalTitle =
    addStep === 'departure' ? '출발지 선택' : `${pendingDeparture ?? ''} → 도착지 선택`;

  const handleModalSelect = (option: string) => {
    if (addStep === 'departure') {
      setPendingDeparture(option as Airport);
      setAddStep('dest');
    } else {
      if (pendingDeparture !== null) {
        const flag = DEST_FLAGS[option] ?? '✈️';
        const isDuplicate = interestedRoutes.some(
          (r) => r.departure === pendingDeparture && r.dest === option,
        );
        if (!isDuplicate) {
          setInterestedRoutes((prev) => [
            ...prev,
            { id: `ir-${Date.now()}`, departure: pendingDeparture, dest: option, flag },
          ]);
        }
      }
      setPendingDeparture(null);
      setAddStep(null);
    }
  };

  const handleModalClose = () => {
    setAddStep(null);
    setPendingDeparture(null);
  };

  const handleRemoveRoute = (id: string) => {
    setInterestedRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleTabPress = (label: string) => {
    if (label === '홈') navigation.popToTop();
    if (label === '비교') navigation.navigate('/compare');
    if (label === '찜') navigation.navigate('/saved');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
              <RouteItem route={route} onRemove={handleRemoveRoute} />
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
        animationType="slide"
        onRequestClose={handleModalClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleModalClose}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <ScrollView>
              {modalOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerOption}
                  onPress={() => handleModalSelect(option)}
                >
                  <Text style={styles.pickerOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
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

// ─── 스타일 ───────────────────────────────────────────────────────────────────

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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  pickerOptionText: {
    fontSize: 15,
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
