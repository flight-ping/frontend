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

export const Route = createRoute('/deal-detail', {
  component: Page,
});

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type DealDetail = {
  id: string;
  airline: string;
  title: string;
  departure: string;
  dest: string;
  flag: string;
  price: number;
  priceText: string;
  saleStart: string;
  saleEnd: string;
  dday: string;
  urgent: boolean;
  color: string;
  imageUrl?: string;
  bookingUrl?: string;
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
  heart: '#FF5252',
};

const DUMMY_DEAL: DealDetail = {
  id: 'd1',
  airline: '진에어',
  title: '일본 5대 노선 특가',
  departure: '인천',
  dest: '도쿄 / 오사카 / 후쿠오카 / 삿포로 / 나고야',
  flag: '🇯🇵',
  price: 143900,
  priceText: '왕복 143,900원~',
  saleStart: '2025.05.15',
  saleEnd: '2025.05.30',
  dday: 'D-12',
  urgent: false,
  color: '#2979FF',
  imageUrl: undefined,
  bookingUrl: 'https://www.jinair.com',
};

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

function Page() {
  const navigation = Route.useNavigation();
  const [saved, setSaved] = useState(false);

  // TODO: route params로 dealId 받아서 API 호출
  const deal = DUMMY_DEAL;

  const handleBooking = () => {
    if (deal.bookingUrl) {
      Linking.openURL(deal.bookingUrl);
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 배너 */}
      {deal.imageUrl ? (
        <Image
          source={{ uri: deal.imageUrl }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.bannerFallback, { backgroundColor: deal.color }]}>
          <Text style={styles.bannerFlag}>{deal.flag}</Text>
          <Text style={styles.bannerAirline}>{deal.airline}</Text>
          <Text style={styles.bannerTitle}>{deal.title}</Text>
        </View>
      )}

      {/* 뒤로가기 + 찜 버튼 (배너 위에 오버레이) */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBtnText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setSaved((prev) => !prev)}
        >
          <Text style={[styles.heartIcon, saved && styles.heartSaved]}>
            {saved ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 기본 정보 */}
        <View style={styles.infoSection}>
          <View style={styles.infoTop}>
            <Text style={styles.airlineName}>{deal.airline}</Text>
            <View style={[styles.ddayBadge, deal.urgent && styles.ddayUrgent]}>
              <Text style={[styles.ddayText, deal.urgent && styles.ddayTextUrgent]}>
                {deal.dday}
              </Text>
            </View>
          </View>
          <Text style={styles.dealTitle}>{deal.title}</Text>
          <Text style={styles.dealDest}>
            {deal.flag} {deal.departure} → {deal.dest}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* 가격 */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>최저가</Text>
          <Text style={styles.priceValue}>{deal.priceText}</Text>
        </View>

        <View style={styles.divider} />

        {/* 판매 기간 */}
        <View style={styles.periodSection}>
          <View style={styles.periodRow}>
            <Text style={styles.periodLabel}>판매 시작</Text>
            <Text style={styles.periodValue}>{deal.saleStart}</Text>
          </View>
          <View style={styles.periodRow}>
            <Text style={styles.periodLabel}>판매 종료</Text>
            <Text style={[styles.periodValue, deal.urgent && { color: COLORS.urgent }]}>
              {deal.saleEnd}
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

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // 배너
  bannerImage: {
    width: '100%',
    height: 220,
  },
  bannerFallback: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bannerFlag: { fontSize: 48 },
  bannerAirline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  // 헤더 오버레이
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
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

  // 스크롤
  scroll: { flex: 1 },

  // 기본 정보
  infoSection: {
    backgroundColor: COLORS.white,
    padding: 20,
  },
  infoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  airlineName: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  ddayBadge: {
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
  dealTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  dealDest: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  divider: {
    height: 8,
    backgroundColor: COLORS.background,
  },

  // 가격
  priceSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
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
