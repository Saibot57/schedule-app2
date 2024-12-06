import type { Box, Schedule, Restriction } from '../types';

export function generateColor(number: number): string {
  const hue = (number * 137.5) % 360;
  return `hsl(${hue}, 70%, 85%)`;
}

export function getBoxPlacements(boxId: number, schedule: Schedule): string {
  return Object.entries(schedule)
    .filter(([, id]) => id === boxId)
    .map(([key]) => {
      const [day, time] = key.split('-');
      return `${day} ${time}`;
    })
    .join(', ');
}

export function checkRestriction(className: string, pattern: string): boolean {
  const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
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

export function getConflicts(
  boxId: number,
  day: string,
  time: string,
  schedule: Schedule,
  boxes: Box[],
  restrictions: Restriction[]
): number[] {
  const box = boxes.find(b => b.id === boxId);
  if (!box) return [];

  const timeSlotBoxIds = Object.entries(schedule)
    .filter(([key]) => {
      const [slotDay, slotTime] = key.split('-');
      return slotDay === day && slotTime.startsWith(time);
    })
    .map(([, id]) => id);

  return timeSlotBoxIds.filter(id => {
    const otherBox = boxes.find(b => b.id === id);
    if (!otherBox || otherBox.id === boxId) return false;
    return hasRestriction(box.className, otherBox.className, restrictions);
  });
}

export function checkRestrictions(
  boxId: number,
  day: string,
  time: string,
  schedule: Schedule,
  boxes: Box[],
  restrictions: Restriction[]
): boolean {
  return getConflicts(boxId, day, time, schedule, boxes, restrictions).length > 0;
}

export function validateScheduleState(
  schedule: Schedule,
  boxes: Box[],
  restrictions: Restriction[]
): boolean {
  const invalidPlacements = Object.entries(schedule).filter(([key, boxId]) => {
    const [day, time] = key.split('-');
    return checkRestrictions(boxId, day, time, schedule, boxes, restrictions);
  });
  return invalidPlacements.length === 0;
}

export function getBoxInSlot(
  day: string, 
  time: string, 
  slotIndex: number, 
  schedule: Schedule, 
  boxes: Box[]
): Box | undefined {
  const slotKey = `${day}-${time}-${slotIndex}`;
  const boxId = schedule[slotKey];
  return boxes.find((box) => box.id === boxId);
}