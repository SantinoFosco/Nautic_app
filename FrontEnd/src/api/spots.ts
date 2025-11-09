import { apiGET } from "./client";

export type SpotInfo = {
  name: string;
  lat: number;
  lon: number;
  type: string;
  best_sport?: string | null;
};

export async function getSpots(day: number = 0) {
  return apiGET<SpotInfo[]>(`/spot/list?day=${day}`);
}

