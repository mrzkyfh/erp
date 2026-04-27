# Color Reference - Slate & Steel Palette

## Quick Reference

### Primary Colors
```
Primary:    #475569  (Slate 600)  - Main brand color
Secondary:  #334155  (Slate 700)  - Secondary actions
Tertiary:   #94A3B8  (Slate 400)  - Subtle elements
```

### Backgrounds
```
Page BG:    #F8FAFC  (Slate 50)   - Main background
Card BG:    #FFFFFF  (White)      - Card/panel background
Muted BG:   #F1F5F9  (Slate 100)  - Muted sections
```

### Text Colors
```
Heading:    #0F172A  (Slate 900)  - Main headings
Body:       #475569  (Slate 600)  - Body text
Muted:      #64748B  (Slate 500)  - Secondary text
Subtle:     #94A3B8  (Slate 400)  - Placeholder/hint
```

### Borders & Lines
```
Border:     #E2E8F0  (Slate 200)  - Default borders
Input:      #CBD5E1  (Slate 300)  - Input borders
Divider:    #F1F5F9  (Slate 100)  - Subtle dividers
```

### Status Colors
```
Success:    #10B981  (Emerald 500)
Warning:    #F59E0B  (Amber 500)
Error:      #DC2626  (Red 600)
Info:       #3B82F6  (Blue 500)
```

## Complete Slate Scale

```
Slate 50:   #F8FAFC  ████████  Lightest - Backgrounds
Slate 100:  #F1F5F9  ████████  Very Light - Muted areas
Slate 200:  #E2E8F0  ████████  Light - Borders
Slate 300:  #CBD5E1  ████████  Light-Medium - Input borders
Slate 400:  #94A3B8  ████████  Medium - Icons, placeholders
Slate 500:  #64748B  ████████  Medium-Dark - Secondary text
Slate 600:  #475569  ████████  Dark - PRIMARY, body text
Slate 700:  #334155  ████████  Darker - SECONDARY, emphasis
Slate 800:  #1E293B  ████████  Very Dark - Strong emphasis
Slate 900:  #0F172A  ████████  Darkest - Headings
```

## Usage Examples

### Buttons
```jsx
// Primary button
<Button className="bg-slate-600 hover:bg-slate-700 text-white">
  Primary Action
</Button>

// Secondary button
<Button className="bg-slate-700 hover:bg-slate-800 text-white">
  Secondary Action
</Button>

// Outline button
<Button className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50">
  Outline Action
</Button>

// Ghost button
<Button className="text-slate-700 hover:bg-slate-100">
  Ghost Action
</Button>
```

### Cards
```jsx
<Card className="bg-white border border-slate-200 rounded-xl shadow-sm">
  <CardHeader>
    <CardTitle className="text-slate-900">Card Title</CardTitle>
    <CardDescription className="text-slate-600">Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Inputs
```jsx
<Input 
  className="border-2 border-slate-300 focus:border-slate-600 focus:ring-slate-600/20"
  placeholder="Enter text..."
/>
```

### Badges
```jsx
// Default
<Badge className="bg-slate-100 text-slate-700 border-slate-200">
  Default
</Badge>

// Success
<Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
  Success
</Badge>

// Warning
<Badge className="bg-amber-50 text-amber-700 border-amber-200">
  Warning
</Badge>

// Error
<Badge className="bg-rose-50 text-rose-700 border-rose-200">
  Error
</Badge>
```

### Navigation
```jsx
// Active nav item
<NavLink className="bg-slate-600 text-white rounded-lg">
  Active Item
</NavLink>

// Inactive nav item
<NavLink className="text-slate-600 hover:bg-slate-50 rounded-lg">
  Inactive Item
</NavLink>
```

### Text Hierarchy
```jsx
<h1 className="text-2xl md:text-4xl font-bold text-slate-900">
  Main Heading
</h1>

<h2 className="text-xl md:text-3xl font-bold text-slate-900">
  Section Heading
</h2>

<h3 className="text-lg md:text-2xl font-semibold text-slate-900">
  Subsection Heading
</h3>

<p className="text-sm md:text-base text-slate-600">
  Body text paragraph
</p>

<p className="text-xs md:text-sm text-slate-500">
  Secondary information
</p>
```

## Gradients

### Background Gradients
```css
/* Page background */
background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);

/* Hero section */
background: linear-gradient(to bottom right, #475569 0%, #1E293B 100%);

/* Subtle mesh */
background: radial-gradient(circle at top left, rgba(148, 163, 184, 0.1), transparent 50%),
            radial-gradient(circle at bottom right, rgba(71, 85, 105, 0.08), transparent 50%);
```

### Button Gradients
```css
/* Primary gradient button */
background: linear-gradient(135deg, #475569 0%, #334155 100%);

/* Hover state */
background: linear-gradient(135deg, #334155 0%, #1E293B 100%);
```

## Shadows

```css
/* Card shadow */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
            0 1px 2px -1px rgba(0, 0, 0, 0.1);

/* Soft shadow */
box-shadow: 0 4px 20px -4px rgba(71, 85, 105, 0.15);

/* Large shadow */
box-shadow: 0 10px 40px -10px rgba(71, 85, 105, 0.2);
```

## Accessibility

### Contrast Ratios (WCAG AA)
```
White on Slate 600:  ✅ 7.35:1  (AAA)
White on Slate 700:  ✅ 10.24:1 (AAA)
Slate 900 on White:  ✅ 16.11:1 (AAA)
Slate 600 on White:  ✅ 7.35:1  (AAA)
Slate 500 on White:  ✅ 4.54:1  (AA)
```

### Color Blind Safe
- ✅ Protanopia (Red-blind)
- ✅ Deuteranopia (Green-blind)
- ✅ Tritanopia (Blue-blind)
- ✅ Monochromacy (Total color blindness)

The Slate palette is inherently color-blind safe as it's a grayscale palette.

## Dark Mode (Future)

If implementing dark mode, use inverted slate scale:

```
Background:     Slate 900
Card:           Slate 800
Border:         Slate 700
Text:           Slate 100
Muted Text:     Slate 400
Primary:        Slate 400 (lighter for dark bg)
```

## Print Styles

For print media:
```css
@media print {
  body {
    background: white;
    color: black;
  }
  
  .bg-slate-600 {
    background: #475569 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

## Export for Design Tools

### Figma/Sketch Variables
```
Primary:        #475569
Secondary:      #334155
Background:     #F8FAFC
Surface:        #FFFFFF
Text Primary:   #0F172A
Text Secondary: #64748B
Border:         #E2E8F0
```

### CSS Custom Properties
```css
:root {
  --color-primary: #475569;
  --color-secondary: #334155;
  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text: #0F172A;
  --color-text-muted: #64748B;
  --color-border: #E2E8F0;
}
```

## Brand Guidelines

### Do's ✅
- Use slate-600 for primary actions
- Use white backgrounds for content cards
- Maintain consistent border radius (lg/xl)
- Use proper text hierarchy
- Ensure sufficient contrast

### Don'ts ❌
- Don't mix with other color palettes
- Don't use slate-900 for backgrounds (too dark)
- Don't use slate-100 for text (too light)
- Don't skip responsive text sizes
- Don't forget hover/active states

## Quick Copy-Paste

### Tailwind Classes
```
Primary Button:     bg-primary hover:bg-slate-700 text-white
Secondary Button:   bg-secondary hover:bg-slate-800 text-white
Outline Button:     border-2 border-slate-300 hover:bg-slate-50
Card:               bg-white border border-slate-200 rounded-xl
Input:              border-2 border-slate-300 focus:border-primary
Heading:            text-slate-900 font-bold
Body Text:          text-slate-600
Muted Text:         text-slate-500
Border:             border-slate-200
Divider:            divide-slate-100
```
