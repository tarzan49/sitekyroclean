import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'playfair':  ['DM Serif Display', 'Georgia', 'serif'],
        'cormorant': ['Cormorant Garamond', 'Georgia', 'serif'],
        'sans':      ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        navy: {
          DEFAULT: "hsl(var(--navy))",
        },
        teal: {
          DEFAULT: "hsl(var(--teal))",
          dark: "hsl(var(--teal-dark))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
        },
        turquoise: {
          DEFAULT: "hsl(var(--turquoise))",
        },
        champagne: {
          DEFAULT: "#f0e8d0",
          light: "#f8f3e8",
          dark: "#d4c9a8",
        },
        charcoal: {
          DEFAULT: "#2a2a3a",
          light: "#3a3a4e",
          dark: "#12121e",
        },
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        large: "var(--shadow-large)",
        premium: "var(--shadow-premium)",
      },
      backgroundImage: {
        "gradient-teal": "var(--gradient-teal)",
        "gradient-turquoise": "var(--gradient-turquoise)",
        "gradient-overlay": "var(--gradient-overlay)",
        "gradient-gold": "var(--gradient-gold)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        // Hero CTA: subtle glow pulse every 3s
        "cta-glow": {
          "0%, 100%": { boxShadow: "0 0 18px rgba(201,168,76,0.35), 0 4px 16px rgba(201,168,76,0.25)" },
          "50%":       { boxShadow: "0 0 40px rgba(201,168,76,0.75), 0 8px 32px rgba(201,168,76,0.50)" },
        },
        // Phone icon: shake every 5s
        "phone-shake": {
          "0%, 82%, 100%": { transform: "rotate(0deg)" },
          "84%":           { transform: "rotate(-12deg)" },
          "86%":           { transform: "rotate(12deg)" },
          "88%":           { transform: "rotate(-10deg)" },
          "90%":           { transform: "rotate(10deg)" },
          "92%":           { transform: "rotate(0deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.5s ease-out",
        "slide-up":       "slide-up 0.6s ease-out",
        "scale-in":       "scale-in 0.4s ease-out",
        "cta-glow":       "cta-glow 3s ease-in-out infinite",
        "phone-shake":    "phone-shake 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
