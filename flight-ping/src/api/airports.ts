import { apiGet } from './client';

export type AirportItem = {
  code: string;
  city: string;
  isoCode: string;
  countryName: string;
  continent: string;
  flag: string;
  display: string;
};

export async function fetchAirports(): Promise<AirportItem[]> {
  const res = await apiGet<{ airports: AirportItem[] }>('/api/v1/airports');
  return res.airports;
}

export async function fetchDepartureAirports(): Promise<AirportItem[]> {
  const res = await apiGet<{ airports: AirportItem[] }>('/api/v1/airports/departures');
  return res.airports;
}

export async function fetchDestinations(departureCode: string): Promise<AirportItem[]> {
  const res = await apiGet<{ airports: AirportItem[] }>(`/api/v1/airports/${departureCode}/destinations`);
  return res.airports;
}
