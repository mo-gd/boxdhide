# Chrome Web Store listing

Copy-paste material for the developer dashboard.

## Store listing

**Name:** BoxdHide

**Summary:** from `manifest.json`.

**Description:**

> Form your own opinion before anyone else's. Knowing a film's average rating, or what your friends gave it, shapes how you watch it. Until you've marked a film as watched, BoxdHide hides:
>
> • Ratings: histogram and average
> • Your friends' ratings
> • Ratings on reviews
> • Reviews (blurred, click one to read it)
> • The banner and synopsis (optional)
>
> Everything comes back as soon as you mark the film as watched, with no reload. Choose what to hide from the toolbar icon.
>
> No tracking, no data collection.
>
> BoxdHide is an independent project, not affiliated with or endorsed by Letterboxd.

**Category:** Entertainment · **Language:** English

**Assets:**

| File | Use |
| --- | --- |
| `icons/icon128.png` | Store icon |
| `store/screenshot-1.png`, `store/screenshot-2.png` | Screenshots (1280×800) |
| `store/promo-small.png` | Small promo tile (440×280) |

## Privacy practices

**Single purpose:** Hide ratings, reviews and other spoilers on Letterboxd film pages until the user has watched the film.

**Permission justification:**

- `storage`: saves the user's choice of what to hide.
- Host access (content script on `letterboxd.com` film pages): hides the chosen elements and checks, on letterboxd.com, whether the user has watched the film.

**Remote code:** No.

**Data usage:** No data collected. Tick the three certifications (no selling, no unrelated use, no creditworthiness use).

**Privacy policy URL:** `https://<user>.github.io/<repo>/#privacy` (GitHub Pages, see README).
