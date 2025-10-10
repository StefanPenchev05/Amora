# 🎨 Design System

> A comprehensive design system for **Amora** - ensuring consistent, accessible, and beautiful user experiences across all interfaces.

## 📖 Table of Contents
- [🎯 Overview](#-overview)
- [🎨 Color Tokens](#-color-tokens)
- [📝 Typography](#-typography)
- [📐 Layout & Spacing](#-layout--spacing)
- [🛠️ Implementation](#-implementation)
- [🎪 Showcase](#-showcase)
- [♿ Accessibility](#-accessibility)
- [📋 Usage Guidelines](#-usage-guidelines)

---

## 🎯 Overview

### **Design Principles**
<!-- Define your design principles here -->
- **Principle 1:** [Description]
- **Principle 2:** [Description]
- **Principle 3:** [Description]

### **Brand Identity**
<!-- Brand personality and values -->
- **Personality:** [Describe the brand personality]
- **Core Values:** [List core values that influence design decisions]
- **Visual Direction:** [Overall visual approach]

---

## 🎨 Color Tokens

### **Brand Colors**
<!-- Primary brand colors that represent your identity -->

#### Primary Palette
```css
/* Primary Brand Colors */
--color-primary-50: #[hex-code];
--color-primary-100: #[hex-code];
--color-primary-200: #[hex-code];
--color-primary-300: #[hex-code];
--color-primary-400: #[hex-code];
--color-primary-500: #[hex-code]; /* Main brand color */
--color-primary-600: #[hex-code];
--color-primary-700: #[hex-code];
--color-primary-800: #[hex-code];
--color-primary-900: #[hex-code];
--color-primary-950: #[hex-code];
```

#### Secondary Palette
```css
/* Secondary Brand Colors */
--color-secondary-50: #[hex-code];
--color-secondary-100: #[hex-code];
--color-secondary-200: #[hex-code];
--color-secondary-300: #[hex-code];
--color-secondary-400: #[hex-code];
--color-secondary-500: #[hex-code]; /* Main secondary color */
--color-secondary-600: #[hex-code];
--color-secondary-700: #[hex-code];
--color-secondary-800: #[hex-code];
--color-secondary-900: #[hex-code];
--color-secondary-950: #[hex-code];
```

### **Neutral Colors**
<!-- Grayscale colors for text, backgrounds, borders -->

```css
/* Neutral Colors */
--color-neutral-50: #[hex-code];   /* Lightest gray */
--color-neutral-100: #[hex-code];
--color-neutral-200: #[hex-code];
--color-neutral-300: #[hex-code];
--color-neutral-400: #[hex-code];
--color-neutral-500: #[hex-code];  /* Mid gray */
--color-neutral-600: #[hex-code];
--color-neutral-700: #[hex-code];
--color-neutral-800: #[hex-code];
--color-neutral-900: #[hex-code];  /* Darkest gray */
--color-neutral-950: #[hex-code];
```

### **Semantic Colors**
<!-- Functional colors for states and feedback -->

#### Success
```css
/* Success Colors */
--color-success-50: #[hex-code];
--color-success-100: #[hex-code];
--color-success-500: #[hex-code]; /* Main success color */
--color-success-600: #[hex-code];
--color-success-900: #[hex-code];
```

#### Warning
```css
/* Warning Colors */
--color-warning-50: #[hex-code];
--color-warning-100: #[hex-code];
--color-warning-500: #[hex-code]; /* Main warning color */
--color-warning-600: #[hex-code];
--color-warning-900: #[hex-code];
```

#### Error
```css
/* Error Colors */
--color-error-50: #[hex-code];
--color-error-100: #[hex-code];
--color-error-500: #[hex-code]; /* Main error color */
--color-error-600: #[hex-code];
--color-error-900: #[hex-code];
```

#### Info
```css
/* Info Colors */
--color-info-50: #[hex-code];
--color-info-100: #[hex-code];
--color-info-500: #[hex-code]; /* Main info color */
--color-info-600: #[hex-code];
--color-info-900: #[hex-code];
```

### **Dark Mode Colors**
<!-- Dark theme color overrides -->

```css
/* Dark Mode Overrides */
:root[data-theme="dark"] {
  --color-background: #[hex-code];
  --color-surface: #[hex-code];
  --color-text-primary: #[hex-code];
  --color-text-secondary: #[hex-code];
  --color-border: #[hex-code];
}
```

---

## 📝 Typography

### **Font Families**

#### Primary Font Stack
```css
/* Primary Typography */
--font-family-primary: "[Font Name]", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-family-secondary: "[Font Name]", Georgia, "Times New Roman", serif;
--font-family-mono: "[Font Name]", "SF Mono", Monaco, "Cascadia Code", monospace;
```

#### Font Sources
<!-- Add font loading configuration -->
```css
/* Font Loading */
@import url('[font-source-url]');
```

### **Font Sizes**

```css
/* Font Size Scale */
--text-xs: [size]rem;    /* [px-equivalent]px */
--text-sm: [size]rem;    /* [px-equivalent]px */
--text-base: [size]rem;  /* [px-equivalent]px - Base size */
--text-lg: [size]rem;    /* [px-equivalent]px */
--text-xl: [size]rem;    /* [px-equivalent]px */
--text-2xl: [size]rem;   /* [px-equivalent]px */
--text-3xl: [size]rem;   /* [px-equivalent]px */
--text-4xl: [size]rem;   /* [px-equivalent]px */
--text-5xl: [size]rem;   /* [px-equivalent]px */
--text-6xl: [size]rem;   /* [px-equivalent]px */
```

### **Font Weights**

```css
/* Font Weights */
--font-thin: [weight];      /* [weight-number] */
--font-light: [weight];     /* [weight-number] */
--font-normal: [weight];    /* [weight-number] */
--font-medium: [weight];    /* [weight-number] */
--font-semibold: [weight];  /* [weight-number] */
--font-bold: [weight];      /* [weight-number] */
--font-extrabold: [weight]; /* [weight-number] */
```

### **Line Heights**

```css
/* Line Heights */
--leading-tight: [ratio];    /* [decimal-value] */
--leading-snug: [ratio];     /* [decimal-value] */
--leading-normal: [ratio];   /* [decimal-value] */
--leading-relaxed: [ratio];  /* [decimal-value] */
--leading-loose: [ratio];    /* [decimal-value] */
```

### **Typography Styles**

<!-- Predefined text styles for consistency -->

#### Headings
```css
/* Heading Styles */
.text-h1 { /* Largest heading */ }
.text-h2 { /* Section heading */ }
.text-h3 { /* Subsection heading */ }
.text-h4 { /* Component heading */ }
.text-h5 { /* Small heading */ }
.text-h6 { /* Smallest heading */ }
```

#### Body Text
```css
/* Body Text Styles */
.text-body-lg { /* Large body text */ }
.text-body { /* Default body text */ }
.text-body-sm { /* Small body text */ }
.text-caption { /* Caption text */ }
.text-overline { /* Overline text */ }
```

---

## 📐 Layout & Spacing

### **Spacing Scale**

```css
/* Spacing Tokens */
--space-0: [size]rem;   /* [px-equivalent]px */
--space-1: [size]rem;   /* [px-equivalent]px */
--space-2: [size]rem;   /* [px-equivalent]px */
--space-3: [size]rem;   /* [px-equivalent]px */
--space-4: [size]rem;   /* [px-equivalent]px */
--space-5: [size]rem;   /* [px-equivalent]px */
--space-6: [size]rem;   /* [px-equivalent]px */
--space-8: [size]rem;   /* [px-equivalent]px */
--space-10: [size]rem;  /* [px-equivalent]px */
--space-12: [size]rem;  /* [px-equivalent]px */
--space-16: [size]rem;  /* [px-equivalent]px */
--space-20: [size]rem;  /* [px-equivalent]px */
--space-24: [size]rem;  /* [px-equivalent]px */
--space-32: [size]rem;  /* [px-equivalent]px */
--space-40: [size]rem;  /* [px-equivalent]px */
--space-48: [size]rem;  /* [px-equivalent]px */
--space-56: [size]rem;  /* [px-equivalent]px */
--space-64: [size]rem;  /* [px-equivalent]px */
```

### **Border Radius**

```css
/* Border Radius */
--radius-none: [size]px;
--radius-sm: [size]px;
--radius: [size]px;      /* Default radius */
--radius-md: [size]px;
--radius-lg: [size]px;
--radius-xl: [size]px;
--radius-2xl: [size]px;
--radius-3xl: [size]px;
--radius-full: [size]px; /* Fully rounded */
```

### **Shadows**

```css
/* Box Shadows */
--shadow-xs: [shadow-definition];
--shadow-sm: [shadow-definition];
--shadow: [shadow-definition];      /* Default shadow */
--shadow-md: [shadow-definition];
--shadow-lg: [shadow-definition];
--shadow-xl: [shadow-definition];
--shadow-2xl: [shadow-definition];
--shadow-inner: [shadow-definition]; /* Inner shadow */
```

### **Breakpoints**

```css
/* Responsive Breakpoints */
--breakpoint-xs: [size]px;   /* Extra small devices */
--breakpoint-sm: [size]px;   /* Small devices */
--breakpoint-md: [size]px;   /* Medium devices */
--breakpoint-lg: [size]px;   /* Large devices */
--breakpoint-xl: [size]px;   /* Extra large devices */
--breakpoint-2xl: [size]px;  /* 2X large devices */
```

---

## 🛠️ Implementation

### **Tailwind Configuration**

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // Add your color tokens here
        primary: {
          // Primary color scale
        },
        secondary: {
          // Secondary color scale
        },
        neutral: {
          // Neutral color scale
        },
        // Semantic colors
        success: {
          // Success color scale
        },
        warning: {
          // Warning color scale
        },
        error: {
          // Error color scale
        },
        info: {
          // Info color scale
        }
      },
      fontFamily: {
        // Font family definitions
      },
      fontSize: {
        // Font size scale
      },
      fontWeight: {
        // Font weight scale
      },
      lineHeight: {
        // Line height scale
      },
      spacing: {
        // Spacing scale
      },
      borderRadius: {
        // Border radius scale
      },
      boxShadow: {
        // Shadow definitions
      },
      screens: {
        // Breakpoint definitions
      }
    }
  }
}
```

### **CSS Variables Setup**

```css
/* globals.css */
:root {
  /* Color tokens */
  
  /* Typography tokens */
  
  /* Layout tokens */
  
  /* Component-specific tokens */
}

/* Dark mode overrides */
:root[data-theme="dark"] {
  /* Dark mode color overrides */
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  /* Reduced motion styles */
}
```

---

## 🎪 Showcase

### **Color Palette Demo**

<!-- Create visual examples of your color palette -->

#### Brand Colors
```html
<!-- Color swatches example -->
<div class="color-palette">
  <div class="color-swatch bg-primary-500">#[hex] - Primary 500</div>
  <div class="color-swatch bg-secondary-500">#[hex] - Secondary 500</div>
</div>
```

#### Usage Examples
```html
<!-- Practical color usage examples -->
<button class="bg-primary-500 hover:bg-primary-600 text-white">
  Primary Button
</button>

<div class="bg-success-50 text-success-800 border border-success-200">
  Success Message
</div>
```

### **Typography Scale Demo**

```html
<!-- Typography examples -->
<div class="typography-showcase">
  <h1 class="text-h1">Heading 1 - [Font size, weight, line height]</h1>
  <h2 class="text-h2">Heading 2 - [Font size, weight, line height]</h2>
  <h3 class="text-h3">Heading 3 - [Font size, weight, line height]</h3>
  
  <p class="text-body">Body text - [Font size, weight, line height]</p>
  <p class="text-body-sm">Small body text - [Font size, weight, line height]</p>
  <p class="text-caption">Caption text - [Font size, weight, line height]</p>
</div>
```

### **Spacing Demo**

```html
<!-- Spacing examples -->
<div class="spacing-showcase">
  <div class="p-4">Padding: 1rem ([px]px)</div>
  <div class="m-8">Margin: 2rem ([px]px)</div>
  <div class="gap-6">Gap: 1.5rem ([px]px)</div>
</div>
```

### **Component Examples**

```html
<!-- Showcase key UI components -->
<div class="component-showcase">
  <!-- Cards -->
  <div class="card">
    <!-- Card content -->
  </div>
  
  <!-- Buttons -->
  <div class="button-group">
    <!-- Different button variants -->
  </div>
  
  <!-- Form Elements -->
  <div class="form-showcase">
    <!-- Input fields, labels, etc. -->
  </div>
</div>
```

---

## ♿ Accessibility

### **Color Contrast Requirements**

<!-- WCAG compliance guidelines -->

#### Contrast Ratios
- **Normal text (AA):** [ratio] minimum
- **Large text (AA):** [ratio] minimum  
- **Normal text (AAA):** [ratio] minimum
- **Large text (AAA):** [ratio] minimum

#### Tested Combinations
```css
/* Verified accessible color combinations */
/* Background: [color] | Text: [color] | Ratio: [ratio] | Status: [Pass/Fail] */
```

### **Motion & Animation**

```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  /* Disable or reduce animations */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### **Focus Management**

```css
/* Focus styles for keyboard navigation */
:focus-visible {
  outline: [outline-style];
  outline-offset: [offset];
}

/* Custom focus styles for components */
.btn:focus-visible {
  /* Button focus styles */
}
```

## 🔄 Maintenance

### **Versioning**
<!-- How to version design system changes -->
- **Current Version:** [version]
- **Last Updated:** [date]
- **Next Review:** [date]

### **Updates & Changes**
<!-- Process for updating the design system -->
- [Process for proposing changes]
- [Review and approval workflow]
- [Implementation and rollout process]
