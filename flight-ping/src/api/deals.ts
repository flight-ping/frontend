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
  flag: string;
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

export async function fetchDealSections(): Promise<DealSection[]> {
  const data = await apiGet<DealSectionResponse>('/api/v1/deals');
  return data.sections;
}

export async function fetchDealById(dealId: number): Promise<DealItem> {
  return apiGet<DealItem>(`/api/v1/deals/${dealId}`);
}
