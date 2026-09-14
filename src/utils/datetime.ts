import { useState, useEffect } from 'react';

/**
 * Returns formatted date and time in Asia/Jakarta timezone (WIB, UTC+7).
 */
export function getJakartaFormattedDateTime(inputDate: Date = new Date()): {
  dayName: string;
  dateFormatted: string;
  timeFormatted: string;
  fullString: string;
} {
  const dayName = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
  }).format(inputDate);

  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(inputDate);

  const timeFormatted = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(inputDate);

  const shortTimeFormatted = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(inputDate);

  const fullString = `${dateFormatted} | ${shortTimeFormatted} WIB`;

  return {
    dayName,
    dateFormatted,
    timeFormatted,
    fullString,
  };
}

/**
 * Hook that supplies ticking real-time Asia/Jakarta clock.
 */
export function useJakartaClock(tickIntervalMs = 1000) {
  const [clock, setClock] = useState(() => getJakartaFormattedDateTime(new Date()));

  useEffect(() => {
    const update = () => setClock(getJakartaFormattedDateTime(new Date()));
    const interval = setInterval(update, tickIntervalMs);
    return () => clearInterval(interval);
  }, [tickIntervalMs]);

  return clock;
}
