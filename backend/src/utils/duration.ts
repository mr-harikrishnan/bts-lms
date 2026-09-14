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
 * Formats total seconds into clean display format like "15 mins", "1h 20m", "45 secs"
 */
export function formatSecondsToDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0 mins';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  if (mins > 0) {
    return `${mins} mins`;
  }
  return `${secs} secs`;
}

/**
 * Parses ISO 8601 duration (e.g. PT15M33S, PT1H20M5S) to total seconds
 */
function parseISO8601Duration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Probes video URL (YouTube, Vimeo) to automatically determine video duration
 */
export async function probeVideoDuration(url: string): Promise<{ durationSeconds: number; formatted: string } | null> {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  // 1. YouTube
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    try {
      const videoId = ytMatch[1];
      const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const html = await res.text();
        const approxMatch = html.match(/"approxDurationMs":"(\d+)"/);
        if (approxMatch) {
          const ms = parseInt(approxMatch[1], 10);
          const totalSec = Math.round(ms / 1000);
          return {
            durationSeconds: totalSec,
            formatted: formatSecondsToDuration(totalSec),
          };
        }
        const metaMatch = html.match(/itemprop=["']duration["']\s+content=["']([^"']+)["']/i);
        if (metaMatch) {
          const totalSec = parseISO8601Duration(metaMatch[1]);
          if (totalSec > 0) {
            return {
              durationSeconds: totalSec,
              formatted: formatSecondsToDuration(totalSec),
            };
          }
        }
      }
    } catch {
      // Fallback on network timeout
    }
  }

  // 2. Vimeo
  if (/vimeo\.com\/(?:video\/)?(\d+)/.test(cleanUrl)) {
    try {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(cleanUrl)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data: any = await res.json();
        if (data && typeof data.duration === 'number' && data.duration > 0) {
          return {
            durationSeconds: data.duration,
            formatted: formatSecondsToDuration(data.duration),
          };
        }
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

/**
 * Formats total minutes into clean display format like "4.5 Hours" or "12 Hours" or "45 Mins"
 */
export function formatMinutesToDuration(totalMinutes: number, weeks?: number): string {
  if (totalMinutes <= 0) return '0 Mins';

  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hrs > 0 && mins > 0) {
    return `${hrs} Hrs ${mins} Mins`;
  } else if (hrs > 0) {
    return `${hrs} Hours`;
  } else {
    return `${mins} Mins`;
  }
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
  const formatted = formatMinutesToDuration(totalMinutes);

  return {
    totalMinutes,
    hoursLive: Math.ceil(totalMinutes / 60),
    formattedDuration: formatted,
  };
}
