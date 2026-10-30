# Peter & Lauren — Baby Gender Reveal V9

## Design
The visual scenes are crops of the single Korean-soft-pastel watercolor storyboard approved in the conversation. This keeps the watercolor, typography, lamb, envelopes, clouds and balloons visually cohesive. The interactive form and results are live HTML; all results are real data, not numbers painted in an image. The illustrations are raster images cropped from a composite artwork, so their on-screen quality is limited by the source resolution; they have not been artificially upscaled. For high-DPI displays, replace with higher-resolution original standalone art in `public/assets` if available.

## Deployment
1. Upload the **contents of this folder** to the root of the existing GitHub repository, keeping `public`, `functions` and `migrations` at the root. Replace older files.
2. In Cloudflare Pages set **Build output directory** to `public` and root to repository root, no build command needed (or `exit 0`).
3. Keep the Cloudflare Pages **D1 binding** named `DB`, connected to the existing `baby-guess-db` database.
4. GitHub push causes Cloudflare Pages automatic deployment.

## Configure baby's actual gender
Edit `public/reveal-config.js`:

```js
window.BABY_REVEAL_CONFIG = { actualGender: 'boy' };
```

Use `'boy'`, `'girl'`, or `null`. When `null`, the post-vote screen shows only the poll results. **The gender is public in this frontend file**, and is not secret from anyone who inspects the website source.

## Database
No new SQL required for an existing database that includes `voter_name` in the `votes` table. New installs: run migration `0001_create_votes.sql`, then `0002_add_voter_name.sql` once.

## View/reset votes
Cloudflare D1 console:
```sql
SELECT voter_name, choice, created_at FROM votes ORDER BY created_at DESC;
SELECT choice, COUNT(*) AS votes FROM votes GROUP BY choice;
```
To delete *all* votes (irreversible): `DELETE FROM votes;`

## Important
- One vote per browser ID only, not strong identity verification.
- Previous voters still retain vote IDs and can see the reveal after opening the envelope.
- The reveal animation and immediate result display are independent of the chosen prediction.
