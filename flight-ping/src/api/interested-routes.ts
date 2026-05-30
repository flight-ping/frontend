import { apiDelete, apiGet, apiPost } from './client';

export type InterestedRouteItem = {
  id: number;
  departure: string;
  dest: string;
};

export async function fetchInterestedRoutes(): Promise<InterestedRouteItem[]> {
  const res = await apiGet<{ routes: InterestedRouteItem[] }>('/api/v1/interested-routes');
  return res.routes;
}

export async function addInterestedRoute(departure: string, dest: string): Promise<InterestedRouteItem> {
  return apiPost<InterestedRouteItem>('/api/v1/interested-routes', { departure, dest });
}

export async function deleteInterestedRoute(routeId: number): Promise<void> {
  return apiDelete(`/api/v1/interested-routes/${routeId}`);
}
