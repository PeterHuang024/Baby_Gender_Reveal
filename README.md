# Baby Gender Guessing Website (Cloudflare Pages + D1)

A soft cream, European-country inspired baby gender guessing site with:
- Intro invitation screen with animated envelope
- Main reveal screen with a sheep popping out of an envelope
- Name / nickname entry before voting
- Team Boy / Team Girl voting
- Immediate shared results after voting
- Cloudflare Pages Functions + D1 database backend

## Existing database
If you already deployed the previous version with `voter_name` added, **no new database migration is needed** for this visual update.

If your original database does **not** yet have the `voter_name` column, run:

```sql
ALTER TABLE votes ADD COLUMN voter_name TEXT;
```

## Deploy update
1. Replace the files in your GitHub repository with this version.
2. Commit and push.
3. Cloudflare Pages will redeploy automatically.
4. Make sure your Pages project still has a D1 binding named `DB`.

## Files
- `public/index.html` – HTML structure
- `public/style.css` – complete visual design and animations
- `public/app.js` – invitation flow + voting logic
- `functions/api/votes.js` – API endpoint for reading/submitting votes
- `migrations/0001_create_votes.sql` – base table creation
- `migrations/0002_add_voter_name.sql` – add voter name column

## Notes
- One browser/device gets one vote based on a generated local voter ID.
- Results display immediately after voting.
- If a browser already voted before, it skips to the reveal screen and shows the current result.

## Actual gender reveal
Edit `public/reveal-config.js`: change `actualGender: null` to `actualGender: 'boy'` or `actualGender: 'girl'`. This must be set before sharing if you want **the actual baby gender** to appear immediately after a vote. With `null`, the site safely shows only vote results rather than inventing a baby gender. The answer is visible in the public website source code, so this is a fun reveal, **not a secret protected against technical users**.
