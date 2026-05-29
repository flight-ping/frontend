import { apiGet } from './client';

export type DealItem = {
  id: number;
  airline: string;
  title: string;
  dest: string;
  price: number;
  priceText: string;
  dday: string;
  urgent: boolean;
  color: string;
  isoCode: string;
  imageUrl?: string;
};

export type RouteItem = {
  routeText: string;
  price: number;
  tripType: string;
};

export type DealDetail = {
  id: number;
  airline: string;
  title: string;
  departure: string;
  dest: string;
  isoCode: string;
  price: number;
  priceText: string;
  saleStart: string;
  saleEnd: string;
  dday: string;
  urgent: boolean;
  color: string;
  imageUrl?: string;
  bookingUrl?: string;
  routes: RouteItem[];
};

export type DealSection = {
  id: string;
  section: string;
  sectionSub: string;
  items: DealItem[];
};

export type DealSectionResponse = {
  sections: DealSection[];
};

export function isoCodeToFlag(isoCode: string): string {
  if (!isoCode) return '';
  return isoCode
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

export async function fetchDealSections(): Promise<DealSection[]> {
  const data = await apiGet<DealSectionResponse>('/api/v1/deals');
  return data.sections;
}

export async function fetchDealById(dealId: number): Promise<DealDetail> {
  return apiGet<DealDetail>(`/api/v1/deals/${dealId}`);
}
