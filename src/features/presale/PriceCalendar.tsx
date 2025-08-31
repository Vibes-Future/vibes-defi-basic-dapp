'use client';

import React, { useState, useEffect } from 'react';

interface PriceTier {
  start_ts: number;
  price_usd: number;
  month: string;
}

// Price schedule data from the smart contract
// For demo purposes, we're using closer timestamps to show the countdown working
const now = Math.floor(Date.now() / 1000);
const PRICE_SCHEDULE: PriceTier[] = [
  { start_ts: now - (30 * 24 * 60 * 60), price_usd: 0.0598, month: "September 2025" },
  { start_ts: now + (7 * 24 * 60 * 60), price_usd: 0.0658, month: "October 2025" },
  { start_ts: now + (37 * 24 * 60 * 60), price_usd: 0.0718, month: "November 2025" },
  { start_ts: now + (67 * 24 * 60 * 60), price_usd: 0.0777, month: "December 2025" },
  { start_ts: now + (97 * 24 * 60 * 60), price_usd: 0.0837, month: "January 2026" },
  { start_ts: now + (127 * 24 * 60 * 60), price_usd: 0.0897, month: "February 2026" },
  { start_ts: now + (157 * 24 * 60 * 60), price_usd: 0.0957, month: "March 2026" },
  { start_ts: now + (187 * 24 * 60 * 60), price_usd: 0.1017, month: "April 2026" },
  { start_ts: now + (217 * 24 * 60 * 60), price_usd: 0.1047, month: "May 2026" },
  { start_ts: now + (247 * 24 * 60 * 60), price_usd: 0.1077, month: "June 2026" },
  { start_ts: now + (277 * 24 * 60 * 60), price_usd: 0.1107, month: "July 2026" },
  { start_ts: now + (307 * 24 * 60 * 60), price_usd: 0.1137, month: "August 2026" }
];

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const PriceCalendar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get current and next price tiers
  const getCurrentTier = () => {
    return PRICE_SCHEDULE
      .filter(tier => currentTime >= tier.start_ts)
      .sort((a, b) => b.start_ts - a.start_ts)[0] || PRICE_SCHEDULE[0];
  };

  const getNextTier = () => {
    return PRICE_SCHEDULE.find(tier => tier.start_ts > currentTime);
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  // Calculate time left until next price increase
  useEffect(() => {
    if (nextTier) {
      const timeDiff = nextTier.start_ts - currentTime;
      const days = Math.floor(timeDiff / (24 * 60 * 60));
      const hours = Math.floor((timeDiff % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((timeDiff % (60 * 60)) / 60);
      const seconds = timeDiff % 60;
      
      setTimeLeft({ days, hours, minutes, seconds });
    }
  }, [currentTime, nextTier]);

  const formatPrice = (price: number) => `$${price.toFixed(4)}`;

  const calculatePriceIncrease = (current: number, next: number) => {
    return (((next - current) / current) * 100).toFixed(1);
  };

  return (
    <div className="price-calendar-container">
      {/* Current Price & Countdown */}
      <div className="current-price-section">
        <div className="price-header">
          <div className="current-price">
            <span className="price-label">Current Price</span>
            <span className="price-value">{formatPrice(currentTier.price_usd)}</span>
          </div>
          
          {nextTier && (
            <div className="next-price-info">
              <span className="next-price-label">Next: {formatPrice(nextTier.price_usd)}</span>
              <span className="price-increase">
                +{calculatePriceIncrease(currentTier.price_usd, nextTier.price_usd)}%
              </span>
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        {nextTier && timeLeft.days >= 0 && (
          <div className="countdown-container">
            <div className="countdown-header">
              <span className="countdown-label">⚡ Price increases in:</span>
            </div>
            <div className="countdown-timer">
              <div className="time-unit">
                <span className="time-value">{timeLeft.days}</span>
                <span className="time-label">Days</span>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <span className="time-value">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="time-label">Hours</span>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <span className="time-value">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="time-label">Min</span>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <span className="time-value">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="time-label">Sec</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Calendar Button */}
      <button 
        className="toggle-calendar-btn"
        onClick={() => setShowFullCalendar(!showFullCalendar)}
      >
        {showFullCalendar ? '📈 Hide Calendar' : '📅 View Full Calendar'}
      </button>

      {/* Full Price Calendar */}
      {showFullCalendar && (
        <div className="full-calendar">
          <div className="calendar-header">
            <h3>💰 Complete Price Schedule</h3>
            <p>Lock in today&apos;s price before it increases!</p>
          </div>
          
          <div className="calendar-grid">
            {PRICE_SCHEDULE.map((tier, index) => {
              const isActive = tier.start_ts <= currentTime && 
                (index === PRICE_SCHEDULE.length - 1 || PRICE_SCHEDULE[index + 1].start_ts > currentTime);
              const isPast = tier.start_ts < currentTime && !isActive;
              const isFuture = tier.start_ts > currentTime;
              
              return (
                <div 
                  key={tier.month}
                  className={`calendar-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''}`}
                >
                  <div className="calendar-month">{tier.month}</div>
                  <div className="calendar-price">{formatPrice(tier.price_usd)}</div>
                  <div className="calendar-status">
                    {isActive && <span className="status-badge current">Current</span>}
                    {isPast && <span className="status-badge past">Past</span>}
                    {isFuture && (
                      <span className="status-badge future">
                        +{calculatePriceIncrease(currentTier.price_usd, tier.price_usd)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="calendar-footer">
            <div className="urgency-message">
              🔥 <strong>Don&apos;t wait!</strong> Prices increase automatically each month.
            </div>
            {nextTier && timeLeft.days <= 3 && (
              <div className="urgent-alert">
                ⚠️ <strong>URGENT:</strong> Price increases in less than {timeLeft.days} day{timeLeft.days !== 1 ? 's' : ''}!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalendar;
