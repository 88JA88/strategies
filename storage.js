(() => {
  const $ = id => document.getElementById(id);
  const message = $('fileMessage');

  function snapshot() {
    const fields = {};
    document.querySelectorAll('#matrix input,#probabilities input').forEach(input => fields[input.id] = input.value);
    return {
      format: 'decisionnel-v1',
      situationName: $('situationName').value,
      situationDescription: $('situationDescription').value,
      blueName: $('blueName').value,
      redName: $('redName').value,
      blueCount: +$('blueCount').value,
      redCount: +$('redCount').value,
      fields
    };
  }

  $('saveJson').onclick = () => {
    const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'strategies-situation.json';
    link.click();
    URL.revokeObjectURL(link.href);
    message.textContent = 'Situation enregistrée dans un fichier JSON.';
  };

  $('restoreJson').onchange = event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
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
          message.textContent = 'Situation restaurée.';
        });
      } catch {
        message.textContent = 'Restauration impossible : ce fichier ne correspond pas à une situation Stratégies.';
      }
    };
    reader.readAsText(file);
  };

  $('resetApp').onclick = () => location.reload();
})();
