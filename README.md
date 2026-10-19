# BoxdHide

Chrome extension that hides Letterboxd ratings and reviews until you have watched a film,
so your opinion isn't shaped by anyone else's.

Choose from the toolbar icon what stays hidden: ratings, friends' ratings, review ratings,
reviews (blurred, click to reveal), and optionally the banner and synopsis.
Everything comes back as soon as the film is marked as watched.

[Website](https://mo-gd.github.io/boxdhide/) · 🇫🇷 My Discord = Impositoire

## Development

Chrome: open `chrome://extensions`, enable **Developer mode**, click **Load unpacked** and select this folder.

Firefox: run `scripts/package.sh`, open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**
and select `dist/boxdhide-<version>-firefox.zip`.

## How it works

`src/content.css` hides everything from first paint. `src/content.js` narrows that down to your
settings (`src/settings.js`), then asks Letterboxd's `/ajax/letterboxd-metadata/` endpoint whether
you watched the film. The sidebar *Watched* button is a live fallback. If anything fails, the page
stays hidden.

## Publishing

`scripts/package.sh` builds `dist/boxdhide-<version>-chrome.zip` and `-firefox.zip` for upload. Listing text, privacy answers
and images are in `store/`; the privacy policy is `PRIVACY.md`.

The project page lives in `docs/`: enable GitHub Pages on the `main` branch, `/docs` folder.

## License

[WTFPL](LICENSE). Not affiliated with Letterboxd.

## AI

This project is vibecoded, the only line that was handwritten is this one. Feel free to contribute, the main thing is to keep the structure simple.
