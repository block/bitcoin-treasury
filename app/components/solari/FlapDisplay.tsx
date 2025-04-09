"use client";

import React, {
  useEffect,
  useState,
  ReactNode,
  useCallback,
  memo,
} from "react";
import { FlapStack } from "./FlapStack";
import { Presets } from "./Presets";

enum Modes {
  Numeric = "num",
  Alphanumeric = "alpha",
  Words = "words",
}

interface RenderProps {
  id?: string;
  className?: string;
  css?: React.CSSProperties;
  children: ReactNode;
  [key: string]: any; // For rest props
}

interface FlapDisplayProps {
  id?: string;
  className?: string;
  css?: React.CSSProperties;
  value: string;
  chars?: string;
  words?: string[];
  length?: number;
  padChar?: string;
  padMode?: "auto" | "start" | "end";
  timing?: number;
  hinge?: boolean;
  color?: string; // New color property
  render?: (props: RenderProps) => ReactNode;
  [key: string]: any; // For rest props
}

const splitChars = (v: string | number): string[] =>
  String(v)
    .split("")
    .map((c) => c.toUpperCase());

const padValue = (
  v: string,
  length?: number,
  padChar: string = " ",
  padStart: boolean = false
): string => {
  if (!length) return v;
  const trimmed = v.slice(0, length);
  return padStart
    ? String(trimmed).padStart(length, padChar)
    : String(trimmed).padEnd(length, padChar);
};

export const FlapDisplay = memo<FlapDisplayProps>(
  ({
    id,
    className,
    css,
    value,
    chars = Presets.NUM,
    words,
    length,
    padChar = " ",
    padMode = "auto",
    timing = 40,
    hinge = true,
    color, // Add color to destructured props
    render,
    ...restProps
  }) => {
    const [stack, setStack] = useState<string[]>([]);
    const [mode, setMode] = useState<Modes>(Modes.Numeric);
    const [digits, setDigits] = useState<string[]>([]);

    useEffect(() => {
      if (words && words.length) {
        setStack(words);
        setMode(Modes.Words);
      } else {
        setStack(splitChars(chars));
        setMode(chars.match(/[a-z]/i) ? Modes.Alphanumeric : Modes.Numeric);
      }
    }, [chars, words]);

    useEffect(() => {
      if (words && words.length) {
        setDigits([value]);
      } else {
        const padStart =
          padMode === "auto"
            ? !!value.match(/^[0-9.,+-]*$/)
            : padMode === "start";
        setDigits(splitChars(padValue(value, length, padChar, padStart)));
      }
    }, [value, chars, words, length, padChar, padMode]);

    const renderFlapStack = useCallback(() => {
      return digits.map((digit, i) => (
        <FlapStack
          key={`${i}-${digit}`}
          stack={stack}
          value={digit}
          mode={mode}
          timing={timing}
          hinge={hinge}
          color={color} // Pass color to FlapStack
          {...restProps}
        />
      ));
    }, [digits, stack, mode, timing, hinge, color, restProps]);

    const containerClassName = className || "";

    if (render) {
      return render({
        id,
        className: containerClassName,
        css,
        ...restProps,
        children: renderFlapStack(),
      }) as React.ReactElement;
    }

    return (
      <div
        id={id}
        className={`${containerClassName} flex relative w-full overflow-hidden justify-center gap-1`}
        style={{
          ...css,
          transform: "perspective(1000px)",
          transition: "transform 0.1s ease-out",
        }}
        aria-hidden="true"
        aria-label={value}
      >
        {renderFlapStack()}
      </div>
    );
  }
);
