// import type { Config } from "tailwindcss";

const config = {
  //   darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // container: {
    //   center: true,
    //   padding: "2rem",
    //   screens: {
    //     "sm": "640px",
    //     "md": "768px",
    //     "lg": "1024px",
    //     "xl": "1280px",
    //     "2xl": "1400px",
    //   },
    // },
    extend: {
      animation: {
        typing: "typing 2s steps(21) alternate, blink .9s",
        glow: 'glow 1.5s infinite',
        'infinite-scroll': 'infinite-scroll 5s linear infinite',
        "fade-in": "fadeIn 5.6s",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        typing: {
          "0%": {
            width: "0%",
            visibility: "hidden"
          },
          "100%": {
            width: "100%",
            // visibility: "visible"
          }
        },
        blink: {
          "50%": {
            borderColor: "transparent"
          },
          "100%": {
            borderColor: "white"
          }
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px #ff00ff' },
          '50%': { boxShadow: '0 0 20px #ff00ff' },
        },
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },

        fadeIn: {
          "0%": { opacity: "0" },
          "60%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        tektur: ["var(--font-tektur)", "system-ui", "sans-serif"],
      },
      // colors: {
      //   border: "var(--border)",
      //   brand: {
      //     DEFAULT: "hsl(var(--brand))",
      //     secondary: "hsl(var(--brand-secondary))",
      //   },
      //   input: "var(--input)",
      //   ring: "var(--ring)",
      //   background: "var(--background)",
      //   foreground: "var(--foreground)",
      //   primary: {
      //     DEFAULT: "hsl(var(--primary))",
      //     foreground: "hsl(var(--primary-foreground))",
      //   },
      //   secondary: {
      //     DEFAULT: "hsl(var(--secondary))",
      //     foreground: "hsl(var(--secondary-foreground))",
      //   },
      //   destructive: {
      //     DEFAULT: "hsl(var(--destructive))",
      //     foreground: "hsl(var(--destructive-foreground))",
      //   },
      //   muted: {
      //     DEFAULT: "hsl(var(--muted))",
      //     foreground: "hsl(var(--muted-foreground))",
      //   },
      //   accent: {
      //     DEFAULT: "hsl(var(--accent))",
      //     foreground: "hsl(var(--accent-foreground))",
      //   },
      //   popover: {
      //     DEFAULT: "hsl(var(--popover))",
      //     foreground: "hsl(var(--popover-foreground))",
      //   },
      //   card: {
      //     DEFAULT: "hsl(var(--card))",
      //     foreground: "hsl(var(--card-foreground))",
      //   },
      // },
      // borderRadius: {
      //   lg: "var(--radius)",
      //   md: "calc(var(--radius) - 2px)",
      //   sm: "calc(var(--radius) - 4px)",
      // },
    },
  },
  plugins: [],
};
// require("tailwindcss-animate")
export default config;
