# Peter & Lauren — Korean Soft Pastel Gender Reveal

Cloudflare Pages + D1 baby gender reveal voting website.

## Set the correct gender (REQUIRED to show the reveal)
Edit `public/reveal-config.js`:

```js
window.BABY_REVEAL_CONFIG = { actualGender: 'boy' };
```

Use `'boy'` or `'girl'` (lowercase with quotes). The initial value is `null`, which means voting shows statistics without revealing a gender. **Please update this file before sharing with guests.** This setting is included in public JavaScript, so a technically knowledgeable guest could inspect it before voting.

## Update your existing Cloudflare Pages site
1. Unzip and copy the **contents** of `baby-gender-guess/` to the root of the GitHub repository `Baby_Gender_Reveal`, preserving folders.
2. Commit and push to `main`.
3. Keep Cloudflare Pages build output directory as `public` (no build command required; `exit 0` is also fine).
4. Keep the production D1 binding named exactly `DB`.
5. Existing votes remain unchanged.

## Database
If your D1 `votes` table already has a `voter_name` column, do not run any SQL. If it does not, apply `migrations/0002_add_voter_name.sql` **once**. This project does not require any extra tables.

To see votes in D1 Console:
```sql
SELECT voter_name, choice, created_at FROM votes ORDER BY created_at DESC;
```
To reset *all* votes (irreversible, including real votes):
```sql
DELETE FROM votes;
```

## Features
- Invitation screen with watercolor envelope (tap to open)
- Korean pastel watercolor scene with a small fluffy lamb and balloons
- Two cloud-shaped voting buttons (both visible)
- Shared name + choice storage through Pages Functions and D1
- Submitting overlay, gender reveal animation, results and share
- Browser identifier for one vote per browser (not strong anti-fraud)
- Returning voters see reveal/results immediately

## Limitations
The reveal answer is public in `reveal-config.js` and is not securely secret. The artwork is included as local PNGs; Google Fonts need a connection and fall back gracefully. A submitted vote cannot be changed with the public interface.
