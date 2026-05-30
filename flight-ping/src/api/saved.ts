import { apiDelete, apiGet, apiPostVoid } from './client';
import type { DealItem } from './deals';

export async function fetchSavedDeals(): Promise<DealItem[]> {
  const res = await apiGet<{ deals: DealItem[] }>('/api/v1/saved');
  return res.deals;
}

export async function saveDeal(dealId: number): Promise<void> {
  return apiPostVoid(`/api/v1/saved/${dealId}`);
}

export async function deleteSavedDeal(dealId: number): Promise<void> {
  return apiDelete(`/api/v1/saved/${dealId}`);
}

export async function getSavedStatus(dealId: number): Promise<boolean> {
  const res = await apiGet<{ saved: boolean }>(`/api/v1/saved/${dealId}/status`);
  return res.saved;
}
