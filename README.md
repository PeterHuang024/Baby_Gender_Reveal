# Baby Gender Reveal V11 — smoother transition and interactive illustrations

Cloudflare Pages + D1. Keep the `DB` binding on the existing Pages project.

## Changes
- The cover transitions directly to the party screen (no intermediate page).
- Main illustration retains natural aspect ratio on phones.
- The party scene gently drifts; a small foreground watercolor-style balloon pair sways. Animations respect reduced-motion settings.
- Team Boy and Team Girl use independent transparent SVG cloud shapes, not tiny screenshot rectangles.
- Results clouds also use the same SVG shape.
- Existing name/choice D1 API and share function remain.

## Actual gender
Edit `public/reveal-config.js`: `actualGender: 'boy'`, `'girl'`, or `null` for results only.
The front-end setting is visible to technically knowledgeable visitors and therefore does not provide secrecy.

## Deploy
Upload the contents of this project folder to the repository root and commit. Use Cloudflare Pages with `public` as build output. Do not run migrations again if your existing `votes` table already includes `voter_name`.

## Important image-quality limitation
The large illustrations in this version are carried over from V10. They were originally crops of a single low-resolution mockup; enlarging them cannot restore lost watercolor detail. A truly crisp version requires newly generated source artwork for each scene, ideally at >=1200 pixels wide, rather than resizing existing images.
