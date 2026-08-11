# Terminal 3 Photography Import Mapping Report

**Purpose**: Map provided real photographs to products and categories before import.

**IMPORTANT**: Never guess ambiguous photos. If a photo could match multiple products, mark it as `REQUIRES_OWNER_CONFIRMATION`.

---

## MAPPING TEMPLATE

| FILE | PRODUCT | CATEGORY | MEDIA TYPE | COVER / GALLERY | NOTES |
|------|---------|----------|------------|----------------|-------|
| (filename) | (product slug or "CATEGORY:slug") | (category slug) | (product-image / content-image / brand-asset) | (cover / gallery) | (any special handling) |

---

## EXPECTED PHOTOGRAPHY GROUPS

### Terminal 3 Branding
- Logo
- Social media assets

### Salmon Products
- Carpaccio
- Classic smoked salmon (fin)
- Sugar-free smoked salmon (fin)
- Sashimi varieties
- Gravlax
- Whole pieces
- Trout
- Tuna

### Salmon Platters
- Various platter compositions

### Charcuterie
- Various charcuterie products

### Charcuterie Platters
- Various platter compositions

### Wine
- Red wines
- White wines
- Rosé

### Whisky
- Single malts
- Blends

### Spirits
- Arak
- Vodka
- Gin
- Rum
- Champagne
- Liqueurs

### Anchovies
- Various anchovy products

### Tuna
- Various tuna products

### Ventresca
- Various ventresca products

### Gourmet
- Fine fish products
- Specialty items

---

## IMPORT GUIDELINES

1. **File Naming**: Use descriptive filenames (e.g., `saumon-classique-fin-200g-01.jpg`)
2. **Aspect Ratio**: Maintain original aspect ratio, do not stretch
3. **File Size**: Optimize for web (max 2MB per image)
4. **Format**: Use JPG for photos, PNG for logos/graphics with transparency
5. **Cover Images**: Each product should have exactly one cover image
6. **Gallery Images**: Products can have multiple gallery images for lifestyle shots

---

## STORAGE BUCKETS

- `product-images` — Public, for product and category photos
- `content-images` — Public, for inspiration articles and editorial content
- `brand-assets` — Public, for logo and branding materials

---

## POST-IMPORT VALIDATION

- [ ] All published products have a cover image
- [ ] No broken image links
- [ ] No stretched images
- [ ] Correct product-to-image mapping
- [ ] Category cover images set
- [ ] Logo displays correctly in header
