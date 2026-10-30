# Baby Gender Reveal V10 — responsive illustration & continuous animation

A Cloudflare Pages + D1 site for Peter & Lauren.

## Improvements versus V9

- Replaced the extra opening **screen** with a crossfade/slide animation inside the first screen: tap envelope → opening artwork appears → voting screen (no 1.1 second dead-end screen).
- All supplied illustrations retain their natural aspect ratios (`height: auto`, `object-fit: contain`), including on narrow phones. No `object-fit: fill`.
- Images re-encoded from existing V9 artwork at high quality, resampled 3x. **Resampling does NOT restore detail missing from the original low-resolution crop.** For truly sharper detail you need newly created, independent high-resolution illustrations rather than crops from a six-panel storyboard.
- Restored both Team Boy and Team Girl cloud art as interactive choices.
- Existing D1 names, vote submission, totals, and gender reveal preserved.

## Deployment

1. Copy the *contents* of this folder to the root of your existing GitHub repository.
2. Commit changes; Cloudflare Pages automatically redeploys. Build output directory: `public`. No build command necessary.
3. Keep your existing Pages D1 binding named `DB`.
4. No database changes are needed if `voter_name` is already present.

## Set the actual reveal

Edit `public/reveal-config.js`. Change `actualGender: null` to `actualGender: 'boy'` or `'girl'`. With `null`, voting shows results without revealing the sex.

This is a front-end configuration file and visitors with technical knowledge can inspect the answer before submitting a vote.

## Testing

For a new vote, use another browser or delete the relevant D1 test record. Deleting records does not delete the table. Test on a narrow phone and a desktop browser.

## Limitations

- Envelope opening is an animated crossfade between two unified illustration frames, **not** a newly hand-animated flap or a separately rigged lamb. It is smoother than V9's three-screen sequence but still uses fixed illustration frames.
- Backgrounds and illustrated words are raster image content; they are not sharp SVG lettering. Replacing the source artwork with separate 1200px+ illustrated scenes is necessary for consistently crisp high-DPI phones.
- One vote per browser is a convenience restriction, not strong identity validation.
