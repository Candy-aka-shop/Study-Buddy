const calculateTimeOverlap = (slot1, slot2) => {
  const [startHour1, startMinute1] = slot1.start_time.split(':').map(Number);
  const [endHour1, endMinute1] = slot1.end_time.split(':').map(Number);
  const [startHour2, startMinute2] = slot2.start_time.split(':').map(Number);
  const [endHour2, endMinute2] = slot2.end_time.split(':').map(Number);

  const startTimeMinutes1 = startHour1 * 60 + startMinute1;
  const endTimeMinutes1 = endHour1 * 60 + endMinute1;
  const startTimeMinutes2 = startHour2 * 60 + startMinute2;
  const endTimeMinutes2 = endHour2 * 60 + endMinute2;

  const overlapStartMinutes = Math.max(startTimeMinutes1, startTimeMinutes2);
  const overlapEndMinutes = Math.min(endTimeMinutes1, endTimeMinutes2);

  return overlapStartMinutes < overlapEndMinutes ? overlapEndMinutes - overlapStartMinutes : 0;
};

module.exports = { calculateTimeOverlap };