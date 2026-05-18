import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cs_discount_deadline';
const HOURS_24_MS = 24 * 60 * 60 * 1000;

interface DiscountTimerReturn {
  timeRemaining: string;
  isExpired: boolean;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
}

export const useDiscountTimer = (): DiscountTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState<string>('24:00:00');
  const [isExpired, setIsExpired] = useState(false);
  const [hoursLeft, setHoursLeft] = useState(24);
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const getOrSetDeadline = useCallback((): number => {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      return parseInt(stored, 10);
    }
    
    // Set new deadline 24 hours from now
    const deadline = Date.now() + HOURS_24_MS;
    localStorage.setItem(STORAGE_KEY, deadline.toString());
    return deadline;
  }, []);

  useEffect(() => {
    const deadline = getOrSetDeadline();

    const updateTimer = () => {
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('00:00:00');
        setHoursLeft(0);
        setMinutesLeft(0);
        setSecondsLeft(0);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setHoursLeft(hours);
      setMinutesLeft(minutes);
      setSecondsLeft(seconds);
      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      setIsExpired(false);
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [getOrSetDeadline]);

  return { timeRemaining, isExpired, hoursLeft, minutesLeft, secondsLeft };
};
