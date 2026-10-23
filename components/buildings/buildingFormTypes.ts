import type { Building, District } from '@prisma/client';

export type FloorPlan = { id: number; floor: number; fileUrl: string; fileName: string | null };

export type BuildingWithDistrict = Building & {
  district: District;
  floorPlans?: FloorPlan[];
  floorsCount?: number | null;
};
