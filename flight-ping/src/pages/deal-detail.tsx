import { createRoute } from '@granite-js/react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchDealById, type DealDetail, type RouteItem } from '../api/deals';
import { deleteSavedDeal, getSavedStatus, saveDeal } from '../api/saved';

export const Route = createRoute('/deal-detail', {
  component: Page,
  validateParams: (params): { dealId: number } => ({
    dealId: Number((params as Record<string, unknown>)?.dealId ?? 0),
  }),
});


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

// 컴포넌트

function RouteRow({ route }: { route: RouteItem }) {
  const priceText = route.price.toLocaleString('ko-KR') + '원~';
  return (
    <View style={styles.routeRow}>
      <View style={styles.routeLeft}>
        <Text style={styles.routeText}>{route.routeText}</Text>
        <View style={[styles.tripTypeBadge, route.tripType === '편도' && styles.tripTypeOW]}>
          <Text style={[styles.tripTypeText, route.tripType === '편도' && styles.tripTypeOWText]}>
            {route.tripType}
          </Text>
        </View>
      </View>
      <Text style={styles.priceValue}>{priceText}</Text>
    </View>
  );
}

function Page() {
  const navigation = Route.useNavigation();
  const { dealId } = Route.useParams();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [selectedDep, setSelectedDep] = useState<string | null>(null);

  useEffect(() => {
    fetchDealById(dealId)
      .then(setDeal)
      .catch(console.error)
      .finally(() => setLoading(false));
    getSavedStatus(dealId).then(setSaved).catch(console.error);
  }, [dealId]);

  const handleBooking = () => {
    if (deal?.bookingUrl) {
      Linking.openURL(deal.bookingUrl);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!deal) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.textSecondary }}>현재 진행 중인 특가 이벤트가 없습니다.</Text>
      </View>
    );
  }

  const getDep = (routeText: string): string => {
    const parts = routeText.split(/\s*↔\s*|\s*-\s*/);
    return (parts[0] ?? '').trim();
  };
  const uniqueDeps = [...new Set(deal.routes.map((r) => getDep(r.routeText)))];
  const filteredRoutes = selectedDep
    ? deal.routes.filter((r) => getDep(r.routeText) === selectedDep)
    : deal.routes;

  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${dateStr} (${DAYS[d.getDay()]})`;
  };

  return (
    <View style={styles.container}>
      {/* 상단 배너 */}
      <View style={[styles.banner, !deal.imageUrl && { backgroundColor: deal.color }]}>
        {deal.imageUrl && (
          <Image source={{ uri: deal.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        )}
        {deal.imageUrl && <View style={styles.bannerOverlay} />}

        <View style={{ flex: 1 }} />

        {/* 항공사 + 제목 + D-day */}
        <View style={styles.bannerContent}>
          <Text style={styles.bannerAirline}>{deal.airline}</Text>
          <Text style={styles.bannerTitle}>{deal.title}</Text>
          <View style={[styles.ddayBadge, deal.urgent && styles.ddayUrgent]}>
            <Text style={[styles.ddayText, deal.urgent && styles.ddayTextUrgent]}>
              {deal.dday}
            </Text>
          </View>
        </View>
      </View>

      {/* 뒤로가기 + 찜 버튼 */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBtnText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={() => {
          if (saved) {
            deleteSavedDeal(dealId).then(() => setSaved(false)).catch(console.error);
          } else {
            saveDeal(dealId).then(() => setSaved(true)).catch(console.error);
          }
        }}>
          <Text style={[styles.heartIcon, saved && styles.heartSaved]}>
            {saved ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 노선 필터 버튼 */}
        {deal.routes && deal.routes.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterBtn, selectedDep === null && styles.filterBtnActive]}
              onPress={() => setSelectedDep(null)}
            >
              <Text style={[styles.filterBtnText, selectedDep === null && styles.filterBtnTextActive]}>전체</Text>
            </TouchableOpacity>
            {uniqueDeps.map((dep) => (
              <TouchableOpacity
                key={dep}
                style={[styles.filterBtn, selectedDep === dep && styles.filterBtnActive]}
                onPress={() => setSelectedDep(dep)}
              >
                <Text style={[styles.filterBtnText, selectedDep === dep && styles.filterBtnTextActive]}>
                  {dep}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 노선 + 최저가 */}
        <View style={styles.routeSection}>
          {deal.routes && deal.routes.length > 0 ? (
            filteredRoutes.map((route, idx) => (
              <RouteRow key={idx} route={route} />
            ))
          ) : (
            <View style={styles.routeRow}>
              <Text style={styles.routeText}>{deal.departure} - {deal.dest}</Text>
              <Text style={styles.priceValue}>{deal.priceText}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* 판매 기간 */}
        <View style={styles.periodSection}>
          <View style={styles.periodRow}>
            <Text style={styles.periodLabel}>판매 시작</Text>
            <Text style={styles.periodValue}>{formatDate(deal.saleStart)}</Text>
          </View>
          <View style={styles.periodRow}>
            <Text style={styles.periodLabel}>판매 종료</Text>
            <Text style={[styles.periodValue, deal.urgent && { color: COLORS.urgent }]}>
              {formatDate(deal.saleEnd)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 안내 */}
        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>유의사항</Text>
          <Text style={styles.noticeText}>
            • 표시된 가격은 왕복 최저가 기준이며, 항공사 사정에 따라 변동될 수 있습니다.{'\n'}
            • 실제 예약은 항공사 공식 홈페이지에서 진행됩니다.{'\n'}
            • 좌석 수량이 한정되어 있어 조기 마감될 수 있습니다.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 예약하기 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bookingBtn, !deal.bookingUrl && styles.bookingBtnDisabled]}
          onPress={handleBooking}
          disabled={!deal.bookingUrl}
        >
          <Text style={styles.bookingBtnText}>항공사 홈페이지에서 예약하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 스타일

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  // 배너
  banner: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  headerRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    zIndex: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: { fontSize: 18, color: '#fff' },
  heartIcon: { fontSize: 18, color: '#fff' },
  heartSaved: { color: COLORS.heart },
  bannerContent: {
    gap: 6,
  },
  bannerAirline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  ddayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.dday,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ddayUrgent: { backgroundColor: '#FFF0F0' },
  ddayText: {
    fontSize: 12,
    color: COLORS.ddayText,
    fontWeight: '600',
  },
  ddayTextUrgent: { color: COLORS.urgent },

  // 스크롤
  scroll: { flex: 1 },

  // 노선 필터
  filterScroll: {
    backgroundColor: COLORS.white,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterBtnTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },

  // 기본 정보
  routeSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  routeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  routeText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  tripTypeBadge: {
    backgroundColor: COLORS.dday,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tripTypeOW: {
    backgroundColor: '#FFF3E0',
  },
  tripTypeText: {
    fontSize: 11,
    color: COLORS.ddayText,
    fontWeight: '600',
  },
  tripTypeOWText: {
    color: '#E65100',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },

  divider: {
    height: 8,
    backgroundColor: COLORS.background,
  },

  // 판매 기간
  periodSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  periodValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  // 유의사항
  noticeSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  noticeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // 하단 예약 버튼
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookingBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookingBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  bookingBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
