import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getChannelId = (uid1: string, uid2: string) => {
  const sorted = [uid1, uid2].sort();
  return `match-${sorted[0]}-${sorted[1]}`;
};
