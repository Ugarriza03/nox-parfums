import type { Config } from "tailwindcss";
import { noxTheme } from "./src/config/theme";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: noxTheme.colors,
      fontFamily: noxTheme.fontFamily as unknown as Record<string, string[]>,
      letterSpacing: noxTheme.letterSpacing,
      maxWidth: noxTheme.maxWidth,
      transitionTimingFunction: noxTheme.transitionTimingFunction
    }
  },
  plugins: []
};
export default config;
