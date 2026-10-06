(() => {
  const $ = id => document.getElementById(id);
  const box = $('probabilities');
  const hint = $('infoHint');

  function state() {
    const fields = [...box.querySelectorAll('input')];
    const blank = fields.filter(field => field.value.trim() === '');
    const sum = fields.reduce((total, field) => total + (field.value.trim() === '' ? 0 : Number(field.value)), 0);
    return { fields, blank, sum };
  }

  function check() {
    const current = state();
    if (current.sum > 100) {
      hint.textContent = 'Erreur : les probabilités dépassent 100 %.';
      return false;
    }
    if (current.blank.length === 1) {
      const field = current.blank[0];
      field.value = (100 - current.sum).toLocaleString('fr-FR', { maximumFractionDigits: 6 }).replace(',', '.');
      field.dataset.automatic = 'true';
      hint.textContent = `La dernière probabilité a été complétée automatiquement à ${field.value} %.`;
      return true;
    }
    if (!current.blank.length) {
      const valid = Math.abs(current.sum - 100) < 1e-8;
      hint.textContent = valid ? 'Distribution complète : 100 %.' : 'Erreur : une distribution complète doit totaliser 100 %.';
      return valid;
    }
    hint.textContent = 'Information partielle : les probabilités non renseignées restent inconnues.';
    return true;
  }

  function analyse() {
    const current = state();
    if (current.sum > 100 || (!current.blank.length && Math.abs(current.sum - 100) > 1e-8)) {
      $('results').textContent = 'Calcul impossible : une distribution complète doit totaliser 100 %.';
      return;
    }
    window.StrategiesApp?.analyse();
  }

  box.addEventListener('input', event => {
    box.querySelectorAll('input[data-automatic="true"]').forEach(field => {
      if (field !== event.target) {
        field.value = '';
        delete field.dataset.automatic;
      }
    });
    delete event.target.dataset.automatic;
    check();
    analyse();
  });

  new MutationObserver(check).observe(box, { childList: true });
  check();
})();
