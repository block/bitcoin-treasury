"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { SolariBoard } from "./components/solari/SolariBoard";
// import { useDisplayLength } from "./components/useDisplayLength";

function formatCurrency(number: number, locale = "en-US", currency = "USD") {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
    notation: "standard",
  });
  return formatter.format(number).replace("$", "USD ");
}

// Initial loading rows - defined outside component to avoid recreation
const getLoadingRows = (displayLength: number) => [
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: " Loading...", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // const displayLength = useDisplayLength();
  const [bitcoinPrice, setBitcoinPrice] = useState(0);
  const previousPriceRef = useRef(0);
  const [priceDirection, setPriceDirection] = useState<string | null>(null);
  const [holding] = useState(8780);
  const [holdingValue, setHoldingValue] = useState(0);
  
  // Calculate display length based on holding value
  const getDisplayLength = (holdingValue: number) => {
    return holdingValue >= 1000000000 ? 22 : 20; // 22 for 1B+, 20 for under
  };
  
  const displayLength = getDisplayLength(holdingValue);
  const [currentRowIndex, setCurrentRowIndex] = useState(-1);
  const [ticker, setTicker] = useState(searchParams.get("ticker") || "XYZ");
  const [inputError, setInputError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(20);
  const [isFetching, setIsFetching] = useState(false);

  // Initialize loading rows immediately
  const loadingBoardRows = useMemo(
    () => getLoadingRows(displayLength),
    [displayLength]
  );

  // Update holding value when Bitcoin price changes
  useEffect(() => {
    setHoldingValue(bitcoinPrice * holding);
  }, [bitcoinPrice, holding]);

  // Format the display values
  const displayValue = error
    ? "Error"
    : `${formatCurrency(bitcoinPrice).toString()}${
        priceDirection ? ` ${priceDirection}` : ""
      }`;

  const holdingDisplay = error ? "Error" : `${holding.toLocaleString("en-US")}`;
  const holdingValueDisplay = error ? "Error" : formatCurrency(holdingValue);

  // Define the final board rows
  const finalBoardRows = useMemo(
    () => [
      { value: "", length: displayLength },
      { value: ` ${ticker}`, length: displayLength },
      { value: "", length: displayLength },
      { value: " TOTAL HOLDINGS", length: displayLength },
      { value: ` BTC ${holdingDisplay}`, length: displayLength },
      { value: ` ${holdingValueDisplay}`, length: displayLength },
      { value: "", length: displayLength },
      { value: " BTC PRICE", length: displayLength },
      { value: ` ${displayValue}`, length: displayLength },
      { value: "", length: displayLength },
    ],
    [ticker, holdingValueDisplay, holdingDisplay, displayValue, displayLength]
  );

  // Current board rows based on loading state and animation progress
  const currentBoardRows = useMemo(() => {
    if (currentRowIndex === -1) {
      return loadingBoardRows;
    }

    return loadingBoardRows.map((row, index) => {
      if (index <= currentRowIndex) {
        return finalBoardRows[index];
      }
      return row;
    });
  }, [loadingBoardRows, finalBoardRows, currentRowIndex]);

  // Handle the row-by-row animation
  useEffect(() => {
    if (!isFetching && currentRowIndex === -1) {
      // Start the row animation after data is loaded
      const animateRows = () => {
        const interval = setInterval(() => {
          setCurrentRowIndex((prev) => {
            if (prev >= finalBoardRows.length - 1) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, 300); // Adjust timing between each row update

        return () => clearInterval(interval);
      };

      // Small delay before starting the animation
      setTimeout(animateRows, 1000);
    }
  }, [isFetching, currentRowIndex, finalBoardRows.length]);

  // Fetch Bitcoin price and manage countdown
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(
          "https://pricing.bitcoin.block.xyz/current-price",
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const newPrice = parseFloat(data["amount"]);

        // Check if this is not the first fetch
        if (!isFetching) {
          // Compare with previous price to determine direction
          if (newPrice > previousPriceRef.current) {
            setPriceDirection("↑");
          } else if (newPrice < previousPriceRef.current) {
            setPriceDirection("↓");
          } else {
            setPriceDirection(null);
          }

          // Remove the direction indicator after 5 seconds (increased from 2 seconds)
          if (newPrice !== previousPriceRef.current) {
            setTimeout(() => {
              setPriceDirection(null);
            }, 2000);
          }
        } else {
          // Set initial price without showing direction
          setPriceDirection(null);
        }

        // Update prices
        const oldPrice = previousPriceRef.current;
        previousPriceRef.current = newPrice;
        setBitcoinPrice(newPrice);
      } catch (err) {
        console.error("Failed to fetch Bitcoin price:", err);
        setError("Failed to fetch Bitcoin price");
      }
      setIsFetching(false);
      setCountdown(20);
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
  }, []);

  return (
    <div className="w-full h-full font-mono flex flex-col justify-center items-center">
      <div className="relative p-4 rounded-lg bg-[#0e0d0d]">
        <SolariBoard rows={currentBoardRows} className="relative" />
      </div>

      <div className="flex flex-rows w-full justify-center opacity-0 transition-opacity duration-300 animate-fadeIn">
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-zinc-400 mt-2 sm:mt-4">
          <div
            className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${
              isFetching
                ? "animate-pulse bg-yellow-500"
                : "animate-pulse bg-green-500"
            }`}
          ></div>
          <div className="text-xs sm:text-sm">
            {isFetching
              ? "Fetching..."
              : `Fetching latest in ${countdown} second${
                  countdown > 1 ? "s" : ""
                }`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
