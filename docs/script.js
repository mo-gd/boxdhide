/** Landing page: interactive demo mirroring the extension, and repository links. */
(() => {
  'use strict';

  // Same keys, labels and defaults as src/settings.js.
  const FEATURES = [
    { key: 'ratings', label: 'Ratings', default: true },
    { key: 'friendRatings', label: "Friends' ratings", default: true },
    { key: 'reviewRatings', label: 'Review ratings', default: true },
    { key: 'reviews', label: 'Reviews', default: true },
    { key: 'backdrop', label: 'Banner', default: false },
    { key: 'synopsis', label: 'Synopsis', default: false },
  ];
  const OPTIONS = [{ key: 'clickToReveal', label: 'Click to reveal reviews', default: true }];
  const DEFAULTS = {
    enabled: true,
    ...Object.fromEntries([...FEATURES, ...OPTIONS].map((s) => [s.key, s.default])),
  };

  const demo = document.querySelector('.demo');
  const popup = demo.querySelector('.popup');
  const fieldset = popup.querySelector('.js-settings');
  const template = popup.querySelector('.js-row');
  const watchButton = demo.querySelector('.js-watch');

  let settings = { ...DEFAULTS };
  let watched = false;

  function render() {
    const hidden = watched || !settings.enabled ? [] : FEATURES.filter((f) => settings[f.key]).map((f) => f.key);
    demo.dataset.hidden = hidden.join(' ');
    demo.toggleAttribute('data-reveal', settings.clickToReveal);
    if (!hidden.includes('reviews')) {
      for (const text of demo.querySelectorAll('.is-revealed')) text.classList.remove('is-revealed');
    }

    for (const input of popup.querySelectorAll('input[data-key]')) input.checked = settings[input.dataset.key];
    fieldset.disabled = !settings.enabled;

    watchButton.classList.toggle('-on', watched);
    watchButton.setAttribute('aria-pressed', String(watched));
    watchButton.querySelector('.js-watch-label').textContent = watched ? 'Watched' : 'Watch';
  }

  function renderRows(container, items) {
    for (const { key, label } of items) {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector('span').textContent = label;
      row.querySelector('input').dataset.key = key;
      container.append(row);
    }
  }

  renderRows(popup.querySelector('.js-features'), FEATURES);
  renderRows(popup.querySelector('.js-options'), OPTIONS);

  popup.addEventListener('change', ({ target }) => {
    settings[target.dataset.key] = target.checked;
    render();
  });

  popup.querySelector('.js-reset').addEventListener('click', () => {
    settings = { ...DEFAULTS };
    render();
  });

  watchButton.addEventListener('click', () => {
    watched = !watched;
    render();
  });

  demo.addEventListener('click', ({ target }) => {
    const text = target.closest('.review-text');
    if (text && settings.clickToReveal && demo.dataset.hidden.split(' ').includes('reviews')) {
      text.classList.add('is-revealed');
    }
  });

  render();

  // On GitHub Pages (<user>.github.io/<repo>/), link to the matching repository.
  const user = location.hostname.match(/^([\w-]+)\.github\.io$/)?.[1];
  const repo = location.pathname.split('/')[1];
  if (user && repo) {
    const url = `https://github.com/${user}/${repo}`;
    for (const link of document.querySelectorAll('.js-repo')) {
      link.href = url;
      link.hidden = false;
    }
    document.querySelector('.js-repo-zip').href = `${url}/archive/refs/heads/main.zip`;
  }
})();
