/**
 * Parses duration strings like "15 mins", "1h 20m", "45m", "01:30:00", "25" into total minutes
 */
export function parseDurationToMinutes(durationStr: string): number {
  if (!durationStr || typeof durationStr !== 'string') return 0;
  const str = durationStr.trim().toLowerCase();

  // Match hh:mm:ss (e.g. 01:25:30)
  const hms = str.match(/^(\d+):(\d{2}):(\d{2})$/);
  if (hms) {
    return parseInt(hms[1], 10) * 60 + parseInt(hms[2], 10) + Math.ceil(parseInt(hms[3], 10) / 60);
  }

  // Match mm:ss (e.g. 18:45)
  const ms = str.match(/^(\d+):(\d{2})$/);
  if (ms) {
    return parseInt(ms[1], 10) + Math.ceil(parseInt(ms[2], 10) / 60);
  }

  let totalMinutes = 0;

  // Match hours: "2h", "2 hours", "2 hrs", "2 hr"
  const hrMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)/);
  if (hrMatch) {
    totalMinutes += Math.round(parseFloat(hrMatch[1]) * 60);
  }

  // Match minutes: "45m", "45 mins", "45 min", "45 minutes"
  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minutes?)/);
  if (minMatch) {
    totalMinutes += Math.round(parseFloat(minMatch[1]));
  }

  // Plain numbers (assume minutes)
  if (!hrMatch && !minMatch && /^\d+$/.test(str)) {
    totalMinutes += parseInt(str, 10);
  }

  return totalMinutes;
}

/**
 * Formats total minutes into clean display format like "4 Hrs 15 Mins" or "12 Weeks (38 Hrs)"
 */
export function formatMinutesToDuration(totalMinutes: number, weeks?: number): string {
  if (totalMinutes <= 0) return '0 Mins';

  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  let timePart = '';
  if (hrs > 0 && mins > 0) {
    timePart = `${hrs} Hrs ${mins} Mins`;
  } else if (hrs > 0) {
    timePart = `${hrs} Hrs`;
  } else {
    timePart = `${mins} Mins`;
  }

  if (weeks && weeks > 0) {
    return `${weeks} Weeks (${timePart})`;
  }

  return timePart;
}

/**
 * Calculates aggregate duration metrics from a list of lessons
 */
export function calculateCurriculumDuration(lessons: Array<{ duration?: string }>, defaultWeeks = 0) {
  let totalMinutes = 0;
  for (const lesson of lessons) {
    if (lesson.duration) {
      totalMinutes += parseDurationToMinutes(lesson.duration);
    }
  }

  const hoursLive = Math.round((totalMinutes / 60) * 10) / 10;
  const formatted = formatMinutesToDuration(totalMinutes, defaultWeeks);

  return {
    totalMinutes,
    hoursLive: Math.ceil(totalMinutes / 60),
    formattedDuration: formatted,
  };
}
