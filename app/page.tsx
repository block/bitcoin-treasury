"use client";

import { SolariBoard } from "./components/solari/SolariBoard";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBitcoinPrice } from "./hooks/useBitcoinPrice";
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
  const displayLength = 20; // Fallback to a fixed length for simplicity

  // Use the custom hook for price data
  const { bitcoinPrice, priceDirection, error, countdown, isFetching } =
    useBitcoinPrice();

  // Get holding from URL, default to 40
  const getHoldingFromParams = () => {
    const holdingParam = searchParams.get("holding");
    if (holdingParam) {
      const parsedHolding = parseFloat(holdingParam);
      // Validate if it's a positive number
      if (!isNaN(parsedHolding) && parsedHolding > 0) {
        return parsedHolding;
      }
      // Optionally: set an error or redirect if invalid?
      // For now, just default back.
    }
    return 8485; // Default value
  };

  const [holding, setHolding] = useState(getHoldingFromParams);
  const [holdingValue, setHoldingValue] = useState(0);
  const [currentRowIndex, setCurrentRowIndex] = useState(-1);
  const [ticker, setTicker] = useState(searchParams.get("ticker") || "XYZ");
  // Removed inputError as it wasn't used
  // Removed explicit error, countdown, isFetching states - now handled by hook

  // Initialize loading rows immediately
  const loadingBoardRows = useMemo(
    () => getLoadingRows(displayLength),
    [displayLength]
  );

  // Update holding value when Bitcoin price changes
  useEffect(() => {
    setHoldingValue(bitcoinPrice * holding);
  }, [bitcoinPrice, holding]);

  // Update holding if URL param changes
  useEffect(() => {
    setHolding(getHoldingFromParams());
  }, [searchParams]); // Re-run when searchParams change

  // Format the display values
  const displayValue = error
    ? error // Display the error message from the hook
    : `${formatCurrency(bitcoinPrice).toString()}${priceDirection ? ` ${priceDirection}` : ""}`;

  const holdingDisplay = error ? "Error" : formatCurrency(holdingValue);
  const holdingDisplayBTC = error ? "Error" : `${holding} BTC`;

  // Define the final board rows
  const finalBoardRows = useMemo(
    () => [
      { value: "", length: displayLength },
      { value: ` ${ticker}`, length: displayLength },
      { value: "", length: displayLength },
      { value: ` ${holdingDisplayBTC}`, length: displayLength, color: "#FFA500" },
      { value: " TOTAL HOLDING USD", length: displayLength },
      { value: ` ${holdingDisplay}`, length: displayLength },
      { value: "", length: displayLength },
      { value: " BTC PRICE", length: displayLength },
      { value: ` ${displayValue}`, length: displayLength },
      { value: "", length: displayLength },
    ],
    [ticker, holdingDisplay, holdingDisplayBTC, displayValue, displayLength]
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
    // Start animation only when initial fetch is done AND no error
    if (!isFetching && currentRowIndex === -1 && !error) {
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
  }, [isFetching, currentRowIndex, finalBoardRows.length, error]); // Added error dependency

  return (
    <div className="w-full h-full font-mono flex flex-col justify-center items-center">
      {/* Input field for holding - Optional feature */}
      {/* Consider adding an input field here if direct editing is desired */}

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
