import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── LifeSaver semantic palette ───────────────────────────────────── */
        void: 'var(--bg-void)',
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        overlay: 'var(--bg-overlay)',
        
        'pulse-core': 'var(--pulse-core)',
        'pulse-glow': 'var(--pulse-glow)',
        'pulse-subtle': 'var(--pulse-subtle)',
        
        'accent-green': 'var(--accent-green)',
        'accent-amber': 'var(--accent-amber)',
        'accent-red': 'var(--accent-red)',
        'accent-purple': 'var(--accent-purple)',
        'accent-cyan': 'var(--accent-cyan)',

        /* Legacy mappings */
        canvas: 'rgb(var(--ls-canvas) / <alpha-value>)',
        'surface-1': 'rgb(var(--ls-surface-1) / <alpha-value>)',
        'surface-2': 'rgb(var(--ls-surface-2) / <alpha-value>)',
        'surface-3': 'rgb(var(--ls-surface-3) / <alpha-value>)',
        glass: {
          1: 'rgba(var(--ls-glass-1))',
          2: 'rgba(var(--ls-glass-2))',
          3: 'rgba(var(--ls-glass-3))',
          nav: 'rgba(var(--ls-glass-nav))',
        },
        cyan: {
          DEFAULT: 'rgb(var(--ls-cyan) / <alpha-value>)',
          glow: 'rgba(var(--ls-cyan-glow) / <alpha-value>)',
        },
        indigo: {
          brand: 'rgb(var(--ls-indigo) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--ls-text-primary) / <alpha-value>)',
          secondary: 'rgba(var(--ls-text-secondary) / <alpha-value>)',
          tertiary: 'rgba(var(--ls-text-tertiary) / <alpha-value>)',
          inverse: 'rgb(var(--ls-text-inverse) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--ls-success) / <alpha-value>)',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: 'rgb(var(--ls-warning) / <alpha-value>)',
          foreground: '#08080F',
        },
        critical: {
          DEFAULT: 'rgb(var(--ls-critical) / <alpha-value>)',
          foreground: '#FFFFFF',
        },
        info: {
          DEFAULT: 'rgb(var(--ls-info) / <alpha-value>)',
          foreground: '#FFFFFF',
        },

        /* ── Shadcn bridge (existing components) ──────────────────────────── */
        background: 'rgb(var(--ls-canvas) / <alpha-value>)',
        foreground: 'rgb(var(--ls-text-primary) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--ls-surface-1) / <alpha-value>)',
          foreground: 'rgb(var(--ls-text-primary) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--ls-surface-2) / <alpha-value>)',
          foreground: 'rgb(var(--ls-text-primary) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--ls-cyan) / <alpha-value>)',
          foreground: 'rgb(var(--ls-text-inverse) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--ls-surface-2) / <alpha-value>)',
          foreground: 'rgb(var(--ls-text-primary) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--ls-surface-3) / <alpha-value>)',
          foreground: 'rgba(var(--ls-text-secondary) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--ls-indigo) / <alpha-value>)',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: 'rgb(var(--ls-critical) / <alpha-value>)',
          foreground: '#FFFFFF',
        },
        border: 'rgba(var(--ls-border) / <alpha-value>)',
        'border-glow': 'rgba(var(--ls-border-glow) / <alpha-value>)',
        input: 'rgba(var(--ls-border) / <alpha-value>)',
        ring: 'rgb(var(--ls-cyan) / <alpha-value>)',
      },

      fontFamily: {
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Syne', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },

      fontSize: {
        'display-xl': ['var(--text-hero)', { lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)', fontWeight: '800' }],
        'display-l': ['var(--text-2xl)', { lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700' }],
        'display-m': ['var(--text-xl)', { lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700' }],
        'heading-1': ['var(--text-lg)', { lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-wide)', fontWeight: '700' }],
        'heading-2': ['var(--text-base)', { lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-wide)', fontWeight: '600' }],
        'heading-3': ['var(--text-sm)', { lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-wider)', fontWeight: '600' }],
        'body-l': ['var(--text-base)', { lineHeight: 'var(--leading-normal)', letterSpacing: '0', fontWeight: '400' }],
        'body-m': ['var(--text-sm)', { lineHeight: 'var(--leading-normal)', letterSpacing: '0', fontWeight: '400' }],
        caption: ['var(--text-xs)', { lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-wider)', fontWeight: '500' }],
      },

      spacing: {
        4.5: '1.125rem',
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
        128: '32rem',
      },

      borderRadius: {
        micro: '6px',
        sm: '12px',
        md: '20px',
        lg: '28px',
        xl: '36px',
        '2xl': '48px',
        full: '9999px',
      },

      boxShadow: {
        'elevation-1': 'var(--shadow-depth-1)',
        'elevation-2': 'var(--shadow-depth-2)',
        'elevation-3': 'var(--shadow-depth-3)',
        'apple-sm': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
        'apple-md': 'var(--shadow-depth-1), inset 0 1px 0 var(--glass-border-highlight)',
        'apple-lg': 'var(--shadow-depth-2), inset 0 1px 0 var(--glass-border-highlight)',
        'apple-xl': 'var(--shadow-depth-3), inset 0 1px 0 var(--glass-border-highlight)',
        glow: '0 0 40px var(--pulse-glow), var(--shadow-depth-2)',
        'glow-sm': '0 0 20px var(--pulse-glow)',
        'hover-lift': 'var(--shadow-depth-2), 0 0 24px var(--pulse-glow)',
      },

      backgroundImage: {
        'accent-gradient': 'var(--gradient-hero)',
        'accent-gradient-r': 'linear-gradient(90deg, #0071E3 0%, #5856D6 100%)',
        'accent-glow': 'radial-gradient(ellipse, var(--pulse-glow) 0%, transparent 70%)',
        'hero-glow': 'var(--gradient-ambient-1), var(--gradient-ambient-2)',
        'focus-ambient': 'var(--gradient-hero-soft)',
        'glass-surface': 'var(--gradient-surface)',
        'apple-gradient': 'var(--gradient-hero)',
        'apple-gradient-soft': 'var(--gradient-hero-soft)',
      },

      backdropBlur: {
        glass: '20px',
        'apple': '24px',
        'apple-strong': '40px',
      },

      height: {
        topbar: 'var(--topbar-height)',
        'btn-md': '2.5rem',
        'btn-icon': '2.25rem',
        input: '2.75rem',
        'nav-item': '3rem',
      },

      padding: {
        topbar: 'var(--topbar-height)',
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed)',
      },

      inset: {
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed)',
      },

      width: {
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed)',
      },

      maxWidth: {
        modal: '37.5rem',
        'command-palette': '35rem',
        prose: '35rem',
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        entrance: '350ms',
        exit: '200ms',
        spring: '300ms',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(-8px)' },
        },
        'slide-axis': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'hover-lift': {
          to: { transform: 'translateY(-2px)' },
        },
        'pulse-cyan': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(0, 217, 255, 0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 8px rgba(0, 217, 255, 0)' },
        },
        'glow-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.95)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-down': 'fade-down 200ms ease-in forwards',
        'slide-axis': 'slide-axis 300ms ease forwards',
        'pulse-cyan': 'pulse-cyan 2s ease-in-out infinite',
        'glow-drift': 'glow-drift 20s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
