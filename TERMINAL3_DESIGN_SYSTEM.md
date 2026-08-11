# Terminal 3 Design System Complete Recap

**Generated**: Design System Documentation
**Status**: Current Implementation

---

## COLOR PALETTE

### Primary Colors
- **Obsidian** (`#080808`) - Background, dark sections
- **Graphite** (`#151515`) - Cards, secondary backgrounds
- **Warm Black** (`#0d0c0b`) - Alternative dark background

### Accent Colors
- **Champagne** (`#c5a35a`) - Primary accent, CTAs, highlights
- **Soft Gold** (`#d4b86a`) - Secondary accent, hover states

### Text Colors
- **Ivory** (`#f4f0e7`) - Primary text
- **White** (`#ffffff`) - Headlines, emphasis
- **Muted Grey** (`#8b8b8b`) - Secondary text, placeholders

### CSS Variables
```css
--t3-obsidian: #080808;
--t3-graphite: #151515;
--t3-warm-black: #0d0c0b;
--t3-champagne: #c5a35a;
--t3-soft-gold: #d4b86a;
--t3-ivory: #f4f0e7;
--t3-white: #ffffff;
--t3-muted-grey: #8b8b8b;
```

---

## TYPOGRAPHY

### Font Families
- **Serif**: Editorial Serif (headlines, luxury feel)
- **Sans**: Editorial Sans (body text, UI elements)

### Font Hierarchy
- **Headlines**: Serif, champagne color, large sizes
- **Body**: Sans, ivory color, readable sizes
- **Captions**: Sans, muted grey, small sizes

---

## NAVBAR DESIGN

### Layout
- Fixed position at top
- Full-width container
- Max-width constraint on desktop
- Mobile hamburger menu

### Elements
- **Logo**: Terminal 3 branding (left)
- **Navigation Links**: Categories, Promotions, Club (center)
- **Account Actions**: Login, Cart (right)
- **Mobile**: Hamburger menu with slide-out drawer

### Styling
- Background: Obsidian
- Text: Ivory
- Hover: Champagne accent
- Border-bottom: Subtle champagne line

---

## BUTTONS & CTAs

### Primary CTA
- Background: Champagne
- Text: Obsidian
- Hover: Soft gold
- Rounded corners: Small radius
- Padding: Generous for touch targets

### Secondary CTA
- Background: Transparent
- Border: Champagne
- Text: Champagne
- Hover: Champagne background with obsidian text

### Ghost Buttons
- Background: Transparent
- Text: Ivory
- Hover: Champagne text

### Disabled State
- Opacity: 0.5
- Cursor: not-allowed

---

## CARD DESIGN

### Product Cards
- Background: Graphite
- Border: Subtle white/10
- Image: Full width, aspect ratio preserved
- Title: Serif, ivory
- Price: Champagne, prominent
- Hover: Border glow with champagne

### Category Cards
- Background: Graphite
- Image: Full width, object-cover
- Title: Serif, overlay
- Hover: Zoom effect on image

### Promotion Cards
- Background: Champagne/5 (subtle tint)
- Border: Champagne/40
- Badge: Members-only indicator
- Timer: Countdown styling

---

## FORM DESIGN

### Input Fields
- Background: Graphite
- Border: White/10
- Text: Ivory
- Placeholder: Muted grey
- Focus: Champagne border
- Padding: Comfortable

### Labels
- Color: Ivory/80
- Size: Small
- Spacing: Above input

### Error States
- Text: Amber-400
- Border: Amber-400
- Icon: AlertTriangle

---

## PAGE DESIGNS

### Homepage
- Hero section with full-width image
- Product grid with luxury spacing
- Promotion carousel
- Inspiration section
- Footer with social links

### Product Detail Page
- Large hero image
- Product info sidebar
- Add to cart CTA
- Related products grid
- Age verification warning for alcohol

### Category Page
- Category hero with cover image
- Product grid with filters
- Sort options
- Breadcrumb navigation

### Checkout Page
- Two-column layout (desktop)
- Cart summary (left)
- Form fields (right)
- Price breakdown
- Age declaration checkbox
- Submit CTA

### Admin Dashboard
- Sidebar navigation
- Card-based overview
- Data tables with actions
- Form modals
- Status badges

---

## ICONS

### Icon Library
- Lucide React icons

### Common Icons
- Shopping cart (cart)
- User (user)
- Search (search)
- Menu (menu)
- Alert (alert-triangle)
- Check (check)
- X (x)
- Heart (heart)

### Icon Styling
- Color: Ivory or Champagne
- Size: Consistent with context
- Hover: Champagne accent

---

## SPACING

### Scale
- Base: 4px (Tailwind default)
- Small: 8px, 12px
- Medium: 16px, 24px
- Large: 32px, 48px
- Extra Large: 64px, 96px

### Container Padding
- Mobile: 16px
- Tablet: 24px
- Desktop: 32px

---

## BORDERS & RADIUS

### Border Radius
- Small: 2px (subtle)
- Medium: 4px (standard)
- Large: 8px (cards)

### Border Colors
- Default: White/10
- Accent: Champagne/40
- Focus: Champagne (solid)

---

## SHADOWS

### Card Shadows
- Subtle: Obsidian with low opacity
- Hover: Slightly elevated

### Button Shadows
- None (flat design)

---

## ANIMATIONS

### Transitions
- Duration: 200ms (fast)
- Easing: Ease-in-out
- Properties: Color, transform, opacity

### Hover Effects
- Buttons: Color shift
- Cards: Border glow
- Images: Subtle zoom

### Loading States
- Spinner: Champagne color
- Skeleton: Graphite background

---

## RESPONSIVE BREAKPOINTS

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## ACCESSIBILITY

### Focus States
- Outline: 2px solid champagne
- Offset: 2px

### Contrast
- Minimum WCAG AA compliant
- Ivory on obsidian: High contrast
- Champagne on obsidian: High contrast

### Reduced Motion
- Disables animations when preferred
- Respects user preferences

---

## CURRENCY DISPLAY

### Format
- Symbol: ₪ (ILS)
- Decimal: 2 places when needed
- Separator: Comma for thousands

### Examples
- 149 ₪
- 10.50 ₪
- 1,299 ₪

### Implementation
- Uses `Intl.NumberFormat` with `he-IL` locale
- Stored as integer agorot (1 ILS = 100 agorot)
- Display function: `formatAgorot(agorot)`

---

## AGE VERIFICATION STYLING

### Warning Banner
- Background: Amber-400/5
- Border: Amber-400/40
- Text: Amber-300
- Icon: AlertTriangle

### Checkbox
- Champagne accent when checked
- Warning text below

---

## STATUS BADGES

### Order Status
- Submitted: Muted grey
- Confirmed: Blue
- Ready: Green
- Completed: Champagne
- Cancelled: Red

### Product Status
- Published: Green
- Draft: Muted grey
- Archived: Red

---

## FOOTER DESIGN

### Layout
- Multi-column grid
- Social links
- Contact information
- Legal links

### Styling
- Background: Obsidian
- Text: Muted grey
- Links: Ivory with champagne hover

---

## IMAGE HANDLING

### Next/Image Configuration
- Responsive sizing
- Lazy loading
- WebP format
- Aspect ratio preservation

### Object Fit
- Product images: object-contain (packshots)
- Lifestyle images: object-cover
- Category covers: object-cover

---

## CURRENT PRICING STRUCTURE

### Delivery Fee
- Pickup: 0 ₪
- Delivery: 10 ₪ (1000 agorot)

### Currency
- All prices in ILS (₪)
- Stored as integer agorot in database
- Displayed with 2 decimal places when needed

---

## MISSING INFORMATION

### Product Prices
- **ACTION REQUIRED**: Please provide product prices in shekels

Format needed:
- Product Name: Price in ₪
- Example: Saumon fumé classique 200g: 45 ₪

Please provide the complete price list from your menu image.

---

## DESIGN FILES NEEDED

### Logo
- Terminal 3 logo (SVG preferred)
- Dark and light variants
- Favicon

### Photography
- Product images (see PHOTOGRAPHY_MAPPING_REPORT.md)
- Category covers
- Lifestyle shots
- Hero images

---

## NEXT STEPS

1. **Provide product prices** in text format
2. **Upload logo** to Supabase Storage
3. **Upload product photos** with mapping
4. **Configure store settings** with real data
5. **Test responsive design** on actual devices
