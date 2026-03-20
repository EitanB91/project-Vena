/**
 * Terminal Theme — Maps Vena design tokens to xterm.js ITheme
 *
 * Hardcoded hex values mirror globals.css tokens.
 * Keep in sync with Nova's design token system.
 * // sync-warning: update if globals.css vena-* tokens change
 */

import type { ITheme } from "@xterm/xterm";

export const venaTerminalTheme: ITheme = {
  background: "#0f0f17", // --vena-surface
  foreground: "#e4e4ef", // --vena-text
  cursor: "#6366f1", // --vena-accent
  cursorAccent: "#0f0f17", // --vena-surface
  selectionBackground: "#6366f133", // --vena-accent @ 20% opacity
  selectionForeground: "#e4e4ef", // --vena-text

  // ANSI normal colors (0–7)
  black: "#08080d", // --vena-bg
  red: "#ef4444", // --vena-error
  green: "#22c55e", // --vena-success
  yellow: "#f59e0b", // --vena-warning
  blue: "#6366f1", // --vena-accent
  magenta: "#a78bfa", // --vena-agent-viktor (purple)
  cyan: "#38bdf8", // --vena-info
  white: "#e4e4ef", // --vena-text

  // ANSI bright colors (8–15)
  brightBlack: "#55556e", // --vena-text-muted
  brightRed: "#f87171",
  brightGreen: "#4ade80",
  brightYellow: "#fbbf24", // --vena-agent-silas
  brightBlue: "#818cf8", // --vena-accent-hover
  brightMagenta: "#f472b6", // --vena-agent-nova (pink)
  brightCyan: "#67e8f9",
  brightWhite: "#ffffff",
};

export const PTY_WS_URL =
  process.env.NEXT_PUBLIC_PTY_URL || "ws://localhost:3001";
