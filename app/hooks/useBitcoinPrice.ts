import { useState, useEffect, useRef } from "react";

interface BitcoinPriceData {
  bitcoinPrice: number;
  priceDirection: string | null;
  error: string | null;
  countdown: number;
  isFetching: boolean;
}

export function useBitcoinPrice(): BitcoinPriceData {
  const [bitcoinPrice, setBitcoinPrice] = useState(0);
  const previousPriceRef = useRef(0);
  const [priceDirection, setPriceDirection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(20);
  const [isFetching, setIsFetching] = useState(true); // Start as true initially

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      setIsFetching(true);
      setError(null); // Clear previous errors
      try {
        const response = await fetch(
          "https://pricing.bitcoin.block.xyz/current-price"
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const newPrice = parseFloat(data["amount"]);

        // Only update direction if not the very first fetch
        if (previousPriceRef.current !== 0) {
          if (newPrice > previousPriceRef.current) {
            setPriceDirection("↑");
          } else if (newPrice < previousPriceRef.current) {
            setPriceDirection("↓");
          } else {
            setPriceDirection(null); // Explicitly set to null if equal
          }

          // Reset direction indicator after a delay
          if (newPrice !== previousPriceRef.current) {
            setTimeout(() => {
              setPriceDirection(null);
            }, 2000);
          }
        } else {
          setPriceDirection(null); // No direction on first load
        }

        setBitcoinPrice(newPrice);
        previousPriceRef.current = newPrice; // Update previous price *after* comparison
      } catch (err) {
        console.error("Failed to fetch Bitcoin price:", err);
        setError("API Error"); // Simpler error message
        setBitcoinPrice(0); // Reset price on error
        setPriceDirection(null);
      } finally {
        setIsFetching(false);
        setCountdown(20); // Reset countdown after fetch attempt
      }
    };

    // Fetch immediately on load
    fetchBitcoinPrice();

    // Set up countdown interval
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchBitcoinPrice(); // Fetch when countdown reaches 0
          return 20; // Reset to 20 seconds
        }
        return prev - 1;
      });
    }, 1000);

    // Clean up intervals on component unmount
    return () => {
      clearInterval(countdownInterval);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  return { bitcoinPrice, priceDirection, error, countdown, isFetching };
}
