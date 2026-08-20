export function calculateTimeLeft(targetDate: string) {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0,
    percentage: 0
  };

  if (difference > 0) {
    const totalSeconds = Math.floor(difference / 1000);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    
    // Calculate months (approx 30 days per month for display purposes)
    const months = Math.floor(days / 30);
    const remainingDaysAfterMonths = days % 30;
    
    const weeks = Math.floor(remainingDaysAfterMonths / 7);
    const finalDays = remainingDaysAfterMonths % 7;

    // Assuming a 6-month (approx 180 days) total duration for the progress bar
    const totalDurationDays = 180;
    const daysCompleted = totalDurationDays - days;
    const percentage = Math.min(100, Math.max(0, (daysCompleted / totalDurationDays) * 100));

    timeLeft = {
      months,
      weeks,
      days: finalDays,
      hours,
      minutes,
      seconds: totalSeconds % 60,
      totalDays: days,
      percentage
    };
  }

  return timeLeft;
}