export interface Box {
  id: number;
  className: string;
  teacher: string;
  color: string;
  quantity: number;
  usageCount: number;
  initialQuantity?: number;
}

export interface Schedule {
  [key: string]: number; // key format: "day-time-slotIndex"
}

export interface Restriction {
  id: number;
  pattern1: string;
  pattern2: string;
}

export interface FormData {
  className: string;
  teacher: string;
}

export interface HoverInfo {
  day: string | null;
  time: string | null;
  slotIndex: number | null;
  show: boolean;
}

export interface Filter {
  label1: string;
  label2: string;
  condition: 'both' | 'neither' | 'x-not-y';
}

export interface ScheduleState {
  boxes: Box[];
  schedule: Schedule;
  restrictions: Restriction[];
}

export const TIME_PERIODS = [
  '8:30-9:30',
  '9:40-10:40',
  '10:55-11:55',
  '12:45-13:45',
  '13:55-14:55'
] as const;

export const DAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag'] as const;

export function checkRestriction(className: string, pattern: string): boolean {
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = pattern
    .split('*')
    .map(escapeRegExp)
    .join('.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(className);
}

export function hasRestriction(box1Name: string, box2Name: string, restrictions: Restriction[]): boolean {
  return restrictions.some(restriction => {
    const matchesPattern1 = checkRestriction(box1Name, restriction.pattern1);
    const matchesPattern2 = checkRestriction(box2Name, restriction.pattern2);
    
    const matchesReverse1 = checkRestriction(box1Name, restriction.pattern2);
    const matchesReverse2 = checkRestriction(box2Name, restriction.pattern1);
    
    return (matchesPattern1 && matchesPattern2) || (matchesReverse1 && matchesReverse2);
  });
}