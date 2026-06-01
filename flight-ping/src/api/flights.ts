import { apiGet } from './client';

export type FlightLeg = {
  airline: string;
  airlineName: string;
  flightNumber: string;
  departure: string; // HH:mm
  arrival: string;   // HH:mm
};

export type FlightResult = {
  price: number;
  duration: number; // 분
  stops: number;
  legs: FlightLeg[];
};

export async function fetchFlights(
  departure: string,
  destination: string,
  date: string,
): Promise<FlightResult[]> {
  const res = await apiGet<{ flights: FlightResult[] }>(
    `/api/v1/flights?departure=${departure}&destination=${destination}&date=${date}`,
  );
  return res.flights;
}
