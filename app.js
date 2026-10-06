(() => {
  const $ = id => document.getElementById(id);
  let c = { b: 2, r: 2 };
  const val = id => $(id)?.value || '';
  const reset = () => $('results').textContent = 'Une valeur a changé : relancez le calcul.';

  function updateTitles() {
    $('gainTitle').textContent = `Espérances de gains pour ${val('blueName') || 'Moi'}`;
    $('probabilityTitle').textContent = `Estimations des probabilités pour ${val('redName') || 'Adverse'} (Facultatif)`;
  }

  function draw(oldValues = {}) {
    c = { b: +$('blueCount').value, r: +$('redCount').value };
    let html = '<div>Bleu ↓<br>Rouge →</div>';
    for (let j = 0; j < c.r; j++) html += `<input id="r${j}" value="${oldValues[`r${j}`] ?? `Rouge ${j + 1}`}">`;
    for (let i = 0; i < c.b; i++) {
      html += `<input id="b${i}" value="${oldValues[`b${i}`] ?? `Bleu ${i + 1}`}">`;
      for (let j = 0; j < c.r; j++) html += `<input class="gain" id="g${i}_${j}" type="number" value="${oldValues[`g${i}_${j}`] ?? ''}">`;
    }
    $('matrix').innerHTML = html;
    probabilities(oldValues);
    updateTitles();
    reset();
  }

  function old() {
    const values = {};
    document.querySelectorAll('#matrix input,#probabilities input').forEach(input => values[input.id] = input.value);
    return values;
  }

  function probabilities(oldValues = {}) {
    let html = '';
    for (let j = 0; j < c.r; j++) html += `<label>${val(`r${j}`)} <input id="p${j}" type="number" min="0" max="100" placeholder="inconnue" value="${oldValues[`p${j}`] ?? ''}"> %</label>`;
    $('probabilities').innerHTML = html;
    $('infoHint').textContent = 'Les pourcentages inconnus sont traités prudemment.';
  }

  function matrix() {
    const A = [];
    for (let i = 0; i < c.b; i++) {
      A[i] = [];
      for (let j = 0; j < c.r; j++) {
        const x = val(`g${i}_${j}`);
        if (x.trim() === '' || !Number.isFinite(Number(x))) return null;
        A[i][j] = +x;
      }
    }
    return A;
  }

  function list(probabilities, prefix, showSeconds = false) {
    const chosen = probabilities.map((p, i) => [p, i]).filter(([p]) => p > 1e-8);
    let seconds = 0;
    return chosen.map(([p, i], index) => {
      seconds += Math.round(60 * p);
      const until = showSeconds && index < chosen.length - 1 ? ` (jusqu’à la ${seconds}e sec.)` : '';
      return `<li><b>${val(prefix + i)}</b> : ${(100 * p).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %${until}</li>`;
    }).join('');
  }

  function run() {
    const A = matrix();
    if (!A) return $('results').textContent = 'Calcul impossible : renseignez tous mes gains avec des nombres.';
    const known = Array(c.r).fill(0), unknown = [];
    let total = 0;
    for (let j = 0; j < c.r; j++) {
      const x = val(`p${j}`);
      if (x === '') unknown.push(j);
      else {
        const p = +x / 100;
        if (p < 0 || p > 1 || !Number.isFinite(p)) return $('results').textContent = 'Probabilité invalide.';
        known[j] = p;
        total += p;
      }
    }
    if (total > 1 + 1e-9) return $('results').textContent = 'Calcul impossible : les probabilités dépassent 100 %.';

    let blue, red, gain;
    if (!unknown.length) {
      const expected = A.map(row => row.reduce((sum, score, j) => sum + score * known[j], 0));
      const best = Math.max(...expected);
      blue = expected.map(score => Math.abs(score - best) < 1e-9 ? 1 : 0);
      red = known;
      gain = best;
    } else {
      const remainder = 1 - total;
      const constrained = A.map(row => unknown.map(j => row.reduce((sum, score, k) => sum + known[k] * score, 0) + remainder * row[j]));
      const solution = BlueSecurityGame.analyse(constrained);
      if (solution.type === 'unresolved') return $('results').textContent = 'Calcul non unique.';
      blue = solution.blue;
      red = known.slice();
      unknown.forEach((j, i) => red[j] += remainder * solution.red[i]);
      gain = solution.value;
    }
    $('results').innerHTML = `<h3>Pour ${val('blueName')}</h3><ul>${list(blue, 'b', true)}</ul><h3>Pour ${val('redName')}</h3><ul>${list(red, 'r')}</ul><p>Gain théorique moyen pour ${val('blueName')} : <b>${gain.toLocaleString('fr-FR', { maximumFractionDigits: 3 })}</b>.</p>`;
  }

  $('blueCount').onchange = () => draw(old());
  $('redCount').onchange = () => draw(old());
  $('matrix').oninput = reset;
  $('probabilities').oninput = reset;
  $('blueName').oninput = updateTitles;
  $('redName').oninput = updateTitles;
  $('analyse').onclick = run;
  draw();
})();
