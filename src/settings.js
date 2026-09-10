/**
 * Settings schema shared by the content script and the popup,
 * persisted in chrome.storage.sync.
 */
const BoxdHideSettings = (() => {
  'use strict';

  /** What can be hidden until the film is watched, in popup order. */
  const FEATURES = [
    { key: 'ratings', label: 'Ratings', default: true },
    { key: 'friendRatings', label: "Friends' ratings", default: true },
    { key: 'reviewRatings', label: 'Review ratings', default: true },
    { key: 'reviews', label: 'Reviews', default: true },
    { key: 'backdrop', label: 'Banner', default: false },
    { key: 'synopsis', label: 'Synopsis', default: false },
  ];

  const OPTIONS = [
    { key: 'clickToReveal', label: 'Click to reveal reviews', default: true },
  ];

  const DEFAULTS = Object.freeze({
    enabled: true,
    ...Object.fromEntries([...FEATURES, ...OPTIONS].map((s) => [s.key, s.default])),
  });

  /** Resolves to the full settings object, with defaults for unset keys. */
  const load = () => chrome.storage.sync.get(DEFAULTS);
  const save = (patch) => chrome.storage.sync.set(patch);
  const reset = () => chrome.storage.sync.clear();

  /** Calls `listener` with fresh settings whenever they change. */
  function subscribe(listener) {
    chrome.storage.onChanged.addListener((_changes, area) => {
      if (area === 'sync') load().then(listener);
    });
  }

  return Object.freeze({ FEATURES, OPTIONS, DEFAULTS, load, save, reset, subscribe });
})();
