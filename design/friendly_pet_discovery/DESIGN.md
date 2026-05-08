---
name: Friendly Pet Discovery
colors:
  surface: '#fbf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#564338'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#897266'
  outline-variant: '#ddc1b3'
  surface-tint: '#9b4500'
  primary: '#9b4500'
  on-primary: '#ffffff'
  primary-container: '#ff8c42'
  on-primary-container: '#6a2d00'
  inverse-primary: '#ffb68d'
  secondary: '#665d50'
  on-secondary: '#ffffff'
  secondary-container: '#ede1d0'
  on-secondary-container: '#6c6356'
  tertiary: '#3c6a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#83ba48'
  on-tertiary-container: '#274700'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68d'
  on-primary-fixed: '#331200'
  on-primary-fixed-variant: '#763300'
  secondary-fixed: '#ede1d0'
  secondary-fixed-dim: '#d1c5b5'
  on-secondary-fixed: '#211b11'
  on-secondary-fixed-variant: '#4d463a'
  tertiary-fixed: '#b8f47a'
  tertiary-fixed-dim: '#9dd761'
  on-tertiary-fixed: '#0e2000'
  on-tertiary-fixed-variant: '#2c5000'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display:
    fontFamily: Quicksand
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-lg:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-padding: 20px
  card-gutter: 16px
---

## Brand & Style

The brand personality of the design system is energetic, heartwarming, and deeply approachable. It aims to evoke the joy of pet companionship through a "Tactile-Modern" aesthetic—combining clean, professional layouts with soft, physical-feeling elements. 

The target audience includes pet lovers and animal shelters seeking a connection-driven experience. The UI emphasizes warmth through high-contrast organic shapes and a focus on high-quality photography. To maintain a professional edge, whitespace is used generously to ensure the playful elements do not clutter the functional flow. The emotional response should be one of optimism and trust, ensuring that the serious task of pet adoption feels like an exciting journey.

## Colors

The palette is anchored by a vibrant, warm orange that represents energy and playfulness. This is balanced by a soft cream secondary color used for large surfaces to prevent visual fatigue.

- **Primary (Warm Orange):** Used for call-to-actions, primary brand moments, and active states.
- **Secondary (Soft Cream):** Used for background containers and softening the contrast between elements.
- **Neutral (Charcoal):** Reserved for typography and iconography to ensure high legibility and a grounded, professional feel.
- **Tertiary (Nature Green):** Introduced for success states and health-related badges, maintaining the organic theme.
- **Background:** A near-white off-cream provides a clean canvas that feels warmer than a sterile pure white.

## Typography

The design system utilizes **Quicksand** across all levels to maintain a friendly and consistent voice. The rounded terminals of the typeface mirror the "soft corner" philosophy of the UI components.

Headlines should use heavier weights (600-700) to create a clear hierarchy against the softer body text. Letter spacing is slightly tightened for large display headers to keep the playful characters feeling cohesive, while labels use a slightly wider tracking and bolder weight to ensure micro-copy remains functional and accessible.

## Layout & Spacing

The layout philosophy follows a **fluid card-based grid** optimized for mobile and tablet interactions. The system relies on a 12-column grid for desktop and a 4-column grid for mobile, with generous 24px gutters to allow the rounded corners of components to breathe.

Spacing follows an 8px rhythmic scale. Deep vertical margins (40px+) are encouraged between major sections to emphasize a relaxed, low-stress user experience. Content should be centered within high-width containers to maintain focus on the central discovery cards.

## Elevation & Depth

This design system uses **Ambient Shadows** and **Tonal Layering** to create a sense of touchable depth. 

- **Level 0 (Flat):** Used for the main background.
- **Level 1 (Subtle):** Low-opacity shadows (4% opacity charcoal) with a high blur radius for cards and static containers. This makes them appear to "float" gently on the soft cream surface.
- **Level 2 (Active):** Higher-contrast shadows (8% opacity) used for hovered or active states, giving the impression that an element is being lifted toward the user.
- **Interactions:** When buttons are pressed, they should visually "sink" (reduce shadow and slightly scale down), providing tactile haptic-like feedback.

## Shapes

The defining characteristic of this design system is its **extra-soft geometry**. 

All primary containers, images, and cards must use a consistent 24px border radius. This high level of roundedness avoids sharp "aggression" and aligns with the friendly nature of the brand. Secondary elements like input fields use a slightly smaller radius (16px), while buttons and chips adopt a full pill-shape (999px) to maximize the "bubbly" and energetic vibe.

## Components

### Buttons
Primary buttons are pill-shaped, filled with the Primary Orange, and feature bold Charcoal text or White text depending on accessibility requirements. Floating Action Buttons (FABs) should use iconography like a heart or a paw print.

### Cards
Cards are the hero of the design system. They must feature a 24px corner radius, a subtle Level 1 ambient shadow, and high-quality edge-to-edge imagery at the top. The bottom section of the card should use the Soft Cream background to house text information.

### Icons
Iconography must be "thick-stroke" and rounded. Key custom icons include:
- **Heart:** For liking/saving.
- **Paw:** For profile/account.
- **Bone:** For rewards or progress indicators.
- **Close/X:** Rendered in a soft charcoal circle for dismissing options.

### Input Fields
Fields should be prominently outlined or filled with a very light version of the cream palette. The focus state uses a 2px Primary Orange border to provide clear professional feedback.

### Progress Bars
Progress indicators should be stylized as a "bone-path" where a paw icon travels along the track, adding a layer of whimsical animation to functional tasks like form completion.