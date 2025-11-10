# 🎨 Quantum Consciousness Theme - Design System

## 🌟 Overview

The **Quantum Consciousness Theme** is a professional, unified design system for HAZoom that combines:
- **Life Energy**: Flowing organic gradients
- **Super Intelligence**: Futuristic typography and animations
- **Quantum Mechanics**: Particle effects and dimensional depth

## 📚 Quick Start

### Import the Theme

```css
/* In any component CSS file */
@import '../styles/quantum-theme.css';
```

The theme is automatically imported in:
- `App.css`
- `index.css`
- All major components

## 🎨 Color Palette

### Primary Colors
```css
var(--quantum-energy)         /* #f093fb - Pink energy flows */
var(--quantum-accent)          /* #4ecdc4 - Cyan consciousness */
var(--quantum-life)            /* #43e97b - Green life force */
var(--quantum-void)            /* #38f9d7 - Teal mystery */
var(--quantum-primary)         /* #667eea - Blue intelligence */
var(--quantum-secondary)       /* #764ba2 - Purple wisdom */
var(--quantum-consciousness)   /* #fa709a - Rose enlightenment */
var(--quantum-intelligence)    /* #fee140 - Golden brilliance */
```

### Background Colors
```css
var(--quantum-dark)            /* #0a0e27 - Dark base */
var(--quantum-darker)          /* #050816 - Darker base */
var(--quantum-deep)            /* #1a1f3a - Deep space */
var(--quantum-surface)         /* rgba(26, 31, 58, 0.8) - Card bg */
var(--quantum-surface-light)   /* rgba(255, 255, 255, 0.05) - Light bg */
```

### Text Colors
```css
var(--text-primary)            /* #ffffff - Main text */
var(--text-secondary)          /* rgba(255, 255, 255, 0.8) - Secondary */
var(--text-tertiary)           /* rgba(255, 255, 255, 0.6) - Tertiary */
var(--text-muted)              /* rgba(255, 255, 255, 0.4) - Muted */
```

## 🎯 Components

### Cards

```jsx
<div className="quantum-card">
  <div className="quantum-card-header">
    <h3 className="quantum-card-title">Card Title</h3>
  </div>
  <div className="quantum-card-body">
    Card content goes here
  </div>
</div>
```

### Buttons

```jsx
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary">Secondary Button</button>
<button className="btn btn-outline">Outline Button</button>
<button className="btn btn-ghost">Ghost Button</button>

/* Sizes */
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary">Medium (default)</button>
<button className="btn btn-primary btn-lg">Large</button>
```

### Inputs

```jsx
<input type="text" className="input" placeholder="Enter text..." />
<textarea className="textarea" placeholder="Enter text..."></textarea>
<select className="select">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Badges

```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-error">Error</span>
<span className="badge badge-outline">Outline</span>
```

## 📐 Layout System

### Grid

```jsx
<div className="grid grid-cols-3 gap-lg">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

/* Responsive: grid-cols-1, grid-cols-2, grid-cols-3, grid-cols-4 */
```

### Flexbox

```jsx
<div className="flex items-center justify-between gap-md">
  <div>Left</div>
  <div>Right</div>
</div>
```

### Container

```jsx
<div className="container">
  /* Centered container with max-width */
</div>
```

## 🎭 Typography

### Headings

```jsx
<h1>Main Heading</h1>  /* Gradient text, 3rem */
<h2>Section Heading</h2>  /* Accent color, 2.25rem */
<h3>Subsection</h3>  /* White, 1.75rem */
<h4>Small Heading</h4>  /* Secondary, 1.5rem */
```

### Fonts

```css
font-family: var(--font-heading);  /* 'Orbitron' - For headings */
font-family: var(--font-body);     /* 'Rajdhani' - For body text */
font-family: var(--font-ui);       /* 'Inter' - For UI elements */
```

## 📏 Spacing

```css
var(--spacing-xs)    /* 4px */
var(--spacing-sm)    /* 8px */
var(--spacing-md)    /* 16px */
var(--spacing-lg)    /* 24px */
var(--spacing-xl)    /* 32px */
var(--spacing-2xl)   /* 48px */

/* Usage */
padding: var(--spacing-lg);
margin-bottom: var(--spacing-md);
gap: var(--spacing-sm);
```

## 🔄 Animations

### Built-in Animations

```css
/* Fade In */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

/* Slide Up */
.slide-up {
  animation: slideUp 0.5s ease-out;
}

/* Pulse */
.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Loading Spinner */
.loading {
  /* Displays a spinning loader */
}
```

### Transitions

```css
transition: all var(--transition-fast);   /* 0.15s */
transition: all var(--transition-base);   /* 0.3s */
transition: all var(--transition-slow);   /* 0.5s */
```

## 🌌 Quantum Background

Apply quantum background with particles to any container:

```jsx
<div className="quantum-bg">
  /* Content with animated quantum background */
</div>
```

This adds:
- Animated gradient background
- Floating particles
- Quantum flow animation

## 🎨 Custom Styling

### Creating Custom Components

```css
.my-component {
  background: var(--quantum-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.my-component:hover {
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  border-color: var(--quantum-primary);
  transform: translateY(-2px);
}
```

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, 
    var(--quantum-energy), 
    var(--quantum-life)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## 📱 Responsive Design

The theme automatically adjusts for:
- Desktop: Full experience
- Tablet (≤1024px): Adjusted layouts
- Mobile (≤768px): Single column, larger touch targets
- Small Mobile (≤480px): Compact spacing

```css
@media (max-width: 768px) {
  /* Your mobile-specific styles */
}
```

## ♿ Accessibility

The theme includes:
- High contrast mode support
- Reduced motion support
- Keyboard focus indicators
- Screen reader optimizations

```css
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* High contrast */
@media (prefers-contrast: high) {
  /* Enhanced contrast styles */
}
```

## 🎭 Advanced Features

### Glassmorphism

```css
.glass-card {
  background: var(--quantum-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
}
```

### Glow Effects

```css
.glow-element {
  box-shadow: var(--shadow-glow);
  /* 0 0 20px rgba(102, 126, 234, 0.5) */
}
```

### Shimmer Animation

```css
.shimmer::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%); }
  100% { transform: translateX(100%) translateY(100%); }
}
```

## 🔧 Customization

### Override Variables

Create a custom CSS file:

```css
:root {
  /* Override theme colors */
  --quantum-primary: #your-color;
  --quantum-accent: #your-color;
  
  /* Override spacing */
  --spacing-lg: 32px;
  
  /* Override transitions */
  --transition-base: 0.5s ease;
}
```

## 📋 Utility Classes

### Margins

```css
.mt-sm, .mt-md, .mt-lg, .mt-xl  /* margin-top */
.mb-sm, .mb-md, .mb-lg, .mb-xl  /* margin-bottom */
```

### Padding

```css
.p-sm, .p-md, .p-lg, .p-xl  /* padding all sides */
```

### Text Alignment

```css
.text-center  /* text-align: center */
.text-left    /* text-align: left */
.text-right   /* text-align: right */
```

### Flex Utilities

```css
.flex          /* display: flex */
.flex-col      /* flex-direction: column */
.items-center  /* align-items: center */
.justify-center   /* justify-content: center */
.justify-between  /* justify-content: space-between */
.gap-sm, .gap-md, .gap-lg  /* gap */
```

## 🎨 Example Page

```jsx
import React from 'react';
import '../styles/quantum-theme.css';

function MyPage() {
  return (
    <div className="quantum-bg">
      <div className="container p-xl">
        <h1 className="text-center mb-lg">Welcome to HAZoom</h1>
        
        <div className="grid grid-cols-3 gap-lg">
          <div className="quantum-card">
            <div className="quantum-card-header">
              <h3 className="quantum-card-title">Feature 1</h3>
            </div>
            <div className="quantum-card-body">
              <p>Amazing quantum features</p>
              <button className="btn btn-primary">Learn More</button>
            </div>
          </div>
          
          {/* More cards... */}
        </div>
      </div>
    </div>
  );
}
```

## 🚀 Performance

The theme is optimized for:
- **Fast Loading**: Minimal CSS bundle
- **GPU Acceleration**: Hardware-accelerated animations
- **Efficient Animations**: Uses transform and opacity
- **Lazy Loading**: Background effects only when needed

## 🐛 Troubleshooting

### Theme not applied?
1. Ensure `quantum-theme.css` is imported
2. Check that CSS variables are supported (modern browsers)
3. Clear browser cache

### Animations laggy?
1. Check if too many animated elements on page
2. Use `will-change` property sparingly
3. Enable hardware acceleration: `transform: translateZ(0)`

### Colors not showing?
1. Verify CSS variable syntax: `var(--variable-name)`
2. Check browser console for CSS errors
3. Ensure no conflicting styles

---

**🌊 For Peace, Intelligence, and Quantum Consciousness! ✨**
