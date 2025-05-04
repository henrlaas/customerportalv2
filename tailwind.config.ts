
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        current: 'currentColor',
        transparent: 'transparent',
        white: '#FFFFFF',
        black: '#000000',
        'black-2': '#090E34',
        stroke: '#E8E8E8',
        gray: '#F7F9FC',
        'gray-dark': '#7C7F86',
        'gray-light': '#E2E8F0',
        'gray-1': '#CED4DA',
        'gray-2': '#F1F1F1',
        'meta-1': '#DC3545',
        'meta-2': '#EFF2F7',
        'meta-3': '#10B981',
        'meta-4': '#313D4A',
        'meta-5': '#259AE6',
        'meta-6': '#FFBA00',
        'meta-7': '#FF6766',
        'meta-8': '#F0950C',
        'meta-9': '#E5E7EB',
        'meta-10': '#0FADCF',
        'meta-11': '#0C95B1',
        primary: '#3C50E0',
        secondary: '#80CAEE',
        danger: '#FF8059',
        warning: '#FFBA00',
        success: '#219653',
        info: '#7791C2',
        dark: '#111928',
        light: '#F8FAFC',
        'body-color': '#637381',
        'body-color-dark': '#8896AB',
        'form-stroke': '#E0E4E9',
        "form-input": "#02022b",
        "dark-gray": "#1D2430",
        'dark-700': "#090e34",
        'brand-blue': '#2563EB',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
        boxdark: "#111827",
        strokedark: "#2E3A47",
        bodydark: "#F1F5F9",
        "bodydark1": "#DEE4EE",
        "bodydark2": "#8A99AF",
        "boxdark-2": "#1A222C",
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
        'evergreen': '#2A9D8F',
        'minty': '#F2FCE2',
      },
      fontFamily: {
        satoshi: ['Satoshi', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
      dropShadow: {
        "1": "0px 1px 0px #E2E8F0",
        "2": "0px 1px 4px rgba(0, 0, 0, 0.12)",
      },
      boxShadow: {
        main: "0px 4px 10px rgba(15, 34, 58, 0.1)",
        smooth: "0 3px 15px rgba(0, 0, 0, 0.02)",
        card: "0px 1px 3px rgba(0, 0, 0, 0.12)",
        "card-2": "0px 1px 2px rgba(0, 0, 0, 0.05)",
        default: "0px 8px 13px -3px rgba(0, 0, 0, 0.07)",
      },
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
