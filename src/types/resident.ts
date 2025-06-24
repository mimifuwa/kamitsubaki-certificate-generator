export interface ResidentData {
  name: string;
  photo: File | null;
  streetNumber: string;
  addressLine: string;
  apartmentInfo?: string;
}

export interface Resident {
  id: string;
  userId: string;
  residentNumber: number;
  name: string;
  photoUrl: string;
  streetNumber: string;
  addressLine: string;
  apartmentInfo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const STREET_OPTIONS = [
  "零番街",
  "壱番街",
  "弐番街",
  "参番街",
  "肆番街",
  "伍番街",
  "陸番街",
] as const;

export type StreetNumber = (typeof STREET_OPTIONS)[number];
