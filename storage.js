(() => {
  const $ = id => document.getElementById(id);
  const message = $('fileMessage');
  const selector = $('storedSituations');
  const openJson = $('openJson');
  const deleteSituation = $('deleteSituation');
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
          window.StrategiesApp?.analyse();
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

  deleteSituation.onclick = () => {
    const name = selector.value;
    if (!name) {
      message.textContent = 'Choisissez une situation à supprimer.';
      return;
    }
    if (!confirm(`Supprimer la situation « ${name} » de cette application ?`)) return;
    const situations = saved();
    delete situations[name];
    localStorage.setItem(KEY, JSON.stringify(situations));
    refreshList();
    message.textContent = `Situation « ${name} » supprimée de la liste.`;
  };

  openJson.onchange = event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.format !== 'decisionnel-v1' || !data.fields) throw Error();
        const fileName = file.name.replace(/\.json$/i, '');
        const name = (data.situationName || fileName).trim() || 'Situation importée';
        data.situationName = name;
        const situations = saved();
        situations[name] = data;
        localStorage.setItem(KEY, JSON.stringify(situations));
        refreshList(name);
        restore(data);
        message.textContent = `Situation « ${name} » ouverte et ajoutée à la liste.`;
      } catch {
        message.textContent = 'Ouverture impossible : ce fichier ne correspond pas à une situation Stratégies.';
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  $('resetApp').onclick = () => location.reload();
  $('refreshApp').onclick = async () => {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') {
      message.textContent = 'Votre application locale est déjà à jour.';
      return;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        message.textContent = 'Votre application est à jour.';
        return;
      }
      let updated = false;
      registration.addEventListener('updatefound', () => { updated = true; }, { once: true });
      await registration.update();
      message.textContent = updated ? 'Application actualisée.' : 'Votre application est à jour.';
    } catch {
      message.textContent = 'Actualisation impossible : vérifiez votre connexion.';
    }
  };
  refreshList();
})();
