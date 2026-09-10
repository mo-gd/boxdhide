/**
 * BoxdHide content script: hides what the user configured on Letterboxd film
 * pages until they have marked the film as watched.
 *
 * content.css hides everything by default. This script narrows that down to
 * the configured features and unlocks the page once watched state is
 * confirmed, by Letterboxd's metadata endpoint or the sidebar "Watched"
 * button. Un-marking the film relocks it.
 */
(() => {
  'use strict';

  const root = document.documentElement;
  const METADATA_URL = '/ajax/letterboxd-metadata/';
  const WATCH_BUTTON = '.watch-link .action.-watch:not(.cannot-watch)';
  const REVIEW_ITEM = '.js-review, .review, .production-viewing, .film-detail';
  // Keep in sync with the blurred selector in content.css.
  const REVIEW_TEXT = `:is(${REVIEW_ITEM}) .body-text`;
  const REVEALED = 'boxdhide-revealed';

  // Areas whose tooltips can spell out a rating (e.g. "★★★½"), per feature.
  const TOOLTIP_ZONES = {
    ratings: '.ratings-histogram-chart',
    friendRatings: '.activity-from-friends',
    reviewRatings: '.film-reviews, .viewing-list, .production-viewing, .js-review, .film-detail',
  };
  const TOOLTIP_ATTRS = ['title', 'data-original-title'];
  const STASH_PREFIX = 'data-boxdhide-';
  const RATING_TEXT = /[★½]/;

  let settings = null; // Until loaded, every feature counts as hidden.
  let watched = false;
  let watchButtonWasOn = false;

  const isConfigured = (key) => !settings || (settings.enabled && settings[key]);
  const isHidden = (key) => !watched && isConfigured(key);

  /** Mirrors the current state onto <html> for content.css. */
  function render() {
    root.setAttribute('data-boxdhide', watched ? 'unlocked' : 'locked');
    if (settings) {
      const shown = BoxdHideSettings.FEATURES.map((f) => f.key).filter((key) => !isConfigured(key));
      root.setAttribute('data-boxdhide-show', shown.join(' '));
      root.toggleAttribute('data-boxdhide-reveal', settings.clickToReveal);
    }
    restoreTooltips();
    scrubTooltips();
  }

  function setWatched(value) {
    if (value === watched) return;
    watched = value;
    render();
  }

  /** Returns the film uid (e.g. "film:307684"), or null if none is found. */
  function resolveUid() {
    const meta = document.querySelector('meta[name="production:identifier"]');
    const poster = document.querySelector('.viewing-poster-container [data-postered-identifier]');
    const uid = parseUid(meta?.content) ?? parseUid(poster?.dataset.posteredIdentifier);
    if (uid) return uid;

    // Last resort: the inline bootstrap `data.viewingable.uid = 'film:123'`.
    for (const script of document.scripts) {
      const match = script.textContent.match(/viewingable\.uid\s*=\s*'([a-z]+:\d+)'/);
      if (match) return match[1];
    }
    return null;
  }

  function parseUid(json) {
    try {
      const { uid } = JSON.parse(json);
      return /^[a-z]+:\d+$/.test(uid) ? uid : null;
    } catch {
      return null;
    }
  }

  /** Asks Letterboxd whether the current user has watched `uid`. */
  async function fetchIsWatched(uid) {
    const response = await fetch(new URL(METADATA_URL, location.origin), {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ productions: uid }),
    });
    if (!response.ok) throw new Error(`Metadata request failed: ${response.status}`);
    const { watched } = await response.json();
    return Array.isArray(watched) && watched.includes(uid);
  }

  /**
   * Follows the sidebar button so marking or un-marking the film applies live.
   * It renders as "not watched" before its own data loads, so only an on→off
   * transition relocks.
   */
  function syncWithWatchButton() {
    const button = document.querySelector(WATCH_BUTTON);
    if (!button) return;
    const isOn = button.classList.contains('-on');
    if (isOn) {
      setWatched(true);
    } else if (watchButtonWasOn) {
      setWatched(false);
    }
    watchButtonWasOn = isOn;
  }

  function scrubTooltips() {
    const zones = Object.keys(TOOLTIP_ZONES).filter(isHidden).map((key) => TOOLTIP_ZONES[key]);
    if (!zones.length) return;
    const selector = `:is(${zones.join(',')}) :is(${TOOLTIP_ATTRS.map((a) => `[${a}]`).join(',')})`;
    for (const el of document.querySelectorAll(selector)) {
      for (const attr of TOOLTIP_ATTRS) {
        const value = el.getAttribute(attr);
        if (value && RATING_TEXT.test(value)) {
          el.setAttribute(STASH_PREFIX + attr, value);
          el.removeAttribute(attr);
        }
      }
    }
  }

  function restoreTooltips() {
    for (const attr of TOOLTIP_ATTRS) {
      const stash = STASH_PREFIX + attr;
      for (const el of document.querySelectorAll(`[${stash}]`)) {
        el.setAttribute(attr, el.getAttribute(stash));
        el.removeAttribute(stash);
      }
    }
  }

  /** First click on a blurred review reveals it instead of following a link. */
  function onClick(event) {
    if (!settings?.clickToReveal || !isHidden('reviews')) return;
    const text = event.target.closest?.(REVIEW_TEXT);
    if (!text || text.classList.contains(REVEALED)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    for (const block of text.closest(REVIEW_ITEM).querySelectorAll('.body-text')) {
      block.classList.add(REVEALED);
    }
  }

  // Letterboxd loads most sections lazily, so re-check once per frame on change.
  let frameRequested = false;
  function onMutation() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(() => {
      frameRequested = false;
      syncWithWatchButton();
      if (!watched) scrubTooltips();
    });
  }

  async function init() {
    new MutationObserver(onMutation).observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', ...TOOLTIP_ATTRS],
    });
    onMutation();

    const uid = resolveUid();
    if (!uid) return;
    try {
      if (await fetchIsWatched(uid)) setWatched(true);
    } catch (error) {
      // Stay locked; the watch button can still unlock the page.
      console.debug('[BoxdHide]', error);
    }
  }

  function applySettings(value) {
    settings = value;
    render();
  }

  render();
  BoxdHideSettings.load().then(applySettings, (error) => console.debug('[BoxdHide]', error));
  BoxdHideSettings.subscribe(applySettings);
  document.addEventListener('click', onClick, true);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
