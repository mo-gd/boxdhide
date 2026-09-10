/** Popup: one switch per setting, saved as soon as it changes. */
(async () => {
  'use strict';

  const { FEATURES, OPTIONS, load, save, reset } = BoxdHideSettings;
  const template = document.getElementById('row-template');
  const fieldset = document.getElementById('settings');

  function renderRows(container, items) {
    for (const { key, label } of items) {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector('span').textContent = label;
      row.querySelector('input').dataset.key = key;
      container.append(row);
    }
  }

  function fill(settings) {
    for (const input of document.querySelectorAll('input[data-key]')) {
      input.checked = settings[input.dataset.key];
    }
    fieldset.disabled = !settings.enabled;
  }

  renderRows(document.getElementById('features'), FEATURES);
  renderRows(document.getElementById('options'), OPTIONS);

  document.addEventListener('change', ({ target }) => {
    const { key } = target.dataset;
    if (!key) return;
    save({ [key]: target.checked });
    if (key === 'enabled') fieldset.disabled = !target.checked;
  });

  document.getElementById('reset').addEventListener('click', async () => {
    await reset();
    fill(await load());
  });

  fill(await load());
  requestAnimationFrame(() => document.body.classList.add('ready'));
})();
