import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface TaskTimerProps {
  interval: string;
  startDate: string;
}

export function TaskTimer({ interval, startDate }: TaskTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const start = new Date(startDate);
      const diff = start.getTime() - now.getTime();

      if (diff <= 0) {
        // Calculate next occurrence based on interval
        const nextDate = new Date(start);
        switch (interval) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        }
        return formatTimeLeft(nextDate.getTime() - now.getTime());
      }

      return formatTimeLeft(diff);
    };

    const formatTimeLeft = (ms: number) => {
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

      return `${days}d ${hours}h ${minutes}m`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [interval, startDate]);

  return (
    <div className="flex items-center text-sm text-gray-500">
      <Timer className="h-5 w-5 mr-2" />
      <span>Next occurrence in: {timeLeft}</span>
    </div>
  );
}