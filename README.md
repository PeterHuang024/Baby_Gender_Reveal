# Baby Gender Reveal Website (Cloudflare Pages + D1)

This version uses illustrated SVG artwork instead of CSS-only geometric shapes.
It includes:
- Invitation intro screen with illustrated sealed envelope
- Main reveal screen with illustrated sheep, open envelope, balloons, and decorative team clouds
- Name / nickname entry before voting
- Team Boy / Team Girl shared voting stored in Cloudflare D1
- Immediate post-vote gender reveal animation (if configured)
- Results page after the reveal animation

## Important: configure the actual baby gender
Edit `public/reveal-config.js`:

```js
window.BABY_REVEAL_CONFIG = {
  actualGender: null
};
```

Change `actualGender` to:
- `'boy'` to show **It's a Boy!** after voting
- `'girl'` to show **It's a Girl!** after voting
- `null` to skip the reveal and go directly to results

## Database
No new database migration is required beyond the existing `voter_name` column.
If your production DB does not yet have it, run:

```sql
ALTER TABLE votes ADD COLUMN voter_name TEXT;
```

## Deploy update
1. Replace the files in your GitHub repository with this version.
2. Commit and push.
3. Cloudflare Pages will redeploy automatically.
4. Confirm your Pages project still has a D1 binding named `DB`.

## Files
- `public/assets/invite-envelope.svg` – illustrated intro envelope
- `public/assets/scene-illustration.svg` – illustrated open envelope + sheep + balloons scene
- `public/assets/cloud-blue.svg` / `cloud-pink.svg` – illustrated cloud artwork
- `public/index.html` – page structure
- `public/style.css` – layout and animations
- `public/app.js` – invitation flow + voting logic

## Notes
- One browser/device gets one vote based on a generated local voter ID.
- If a visitor already voted before, revisiting the page goes straight to the results.
- The reveal answer is stored client-side in `reveal-config.js`, so it is suitable for a fun reveal page but not perfect secrecy.
