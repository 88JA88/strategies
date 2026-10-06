(() => {
  const $ = id => document.getElementById(id);
  const message = $('fileMessage');
  const selector = $('storedSituations');
  const KEY = 'strategies-situations-v1';

  function snapshot() {
    const fields = {};
    document.querySelectorAll('#matrix input,#probabilities input').forEach(input => fields[input.id] = input.value);
    return {
      format: 'decisionnel-v1',
      situationName: $('situationName').value.trim(),
      situationDescription: $('situationDescription').value,
      blueName: $('blueName').value,
      redName: $('redName').value,
      blueCount: +$('blueCount').value,
      redCount: +$('redCount').value,
      fields
    };
  }

  function saved() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
  }

  function refreshList(selected = '') {
    const situations = saved();
    selector.innerHTML = '<option value="">Choisir…</option>';
    Object.keys(situations).sort((a, b) => a.localeCompare(b, 'fr')).forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      selector.append(option);
    });
    selector.value = selected;
  }

  function restore(data) {
    if (data.format !== 'decisionnel-v1' || !data.fields) throw Error();
    $('situationName').value = data.situationName || '';
    $('situationDescription').value = data.situationDescription || '';
    $('blueName').value = data.blueName || 'Moi';
    $('redName').value = data.redName || 'Adverse';
    $('blueCount').value = data.blueCount;
    $('redCount').value = data.redCount;
    $('blueCount').dispatchEvent(new Event('change'));
    requestAnimationFrame(() => {
      Object.entries(data.fields).forEach(([id, value]) => {
        const input = $(id);
        if (input) input.value = value;
      });
      $('analyse').click();
    });
  }

  $('saveJson').onclick = () => {
    const data = snapshot();
    if (!data.situationName) {
      message.textContent = 'Donnez un nom à cette situation avant de l’enregistrer.';
      return;
    }
    const situations = saved();
    situations[data.situationName] = data;
    localStorage.setItem(KEY, JSON.stringify(situations));
    refreshList(data.situationName);

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${data.situationName}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    message.textContent = `Situation « ${data.situationName} » enregistrée.`;
  };

  selector.onchange = () => {
    if (!selector.value) return;
    try {
      restore(saved()[selector.value]);
      message.textContent = `Situation « ${selector.value} » restaurée.`;
    } catch {
      message.textContent = 'Restauration impossible.';
    }
  };

  $('resetApp').onclick = () => location.reload();
  refreshList();
})();
