// Renders /admin/api/stats into the tables on admin.html. No dependencies.

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat();

const who = document.body.dataset.identity;
if (who) $('who').textContent = `Signed in as ${who}`;

function cell(tag, text, cls) {
  const el = document.createElement(tag);
  el.textContent = text;
  if (cls) el.className = cls;
  return el;
}

function num(n) {
  return cell('td', fmt.format(n), n ? '' : 'zero');
}

function table(el, head, rows) {
  el.replaceChildren();
  const thead = el.createTHead().insertRow();
  for (const h of head) thead.append(cell('th', h));
  const tbody = el.createTBody();
  for (const r of rows) {
    const tr = tbody.insertRow();
    for (const c of r) tr.append(c);
  }
}

function render(data) {
  const keys = Object.keys(data.events);

  table(
    $('totals'),
    ['Event', 'Today', 'Last 7 days', `Last ${data.days} days`, 'All time'],
    keys.map((k) => {
      const t = data.totals[k];
      return [cell('td', t.label), num(t.today), num(t.week), num(t.range), num(t.all)];
    }),
  );

  $('presets-lede').textContent = data.presets.length
    ? `Over the last ${data.days} days, most-copied first.`
    : `No suggestions opened in the last ${data.days} days.`;
  table(
    $('presets'),
    ['Suggestion', 'Opened', 'Saved', 'Copied'],
    data.presets.map((p) => {
      const name = cell('td', '');
      name.append(cell('code', p.preset));
      return [name, num(p.opened), num(p.saved), num(p.copied)];
    }),
  );

  $('daily-lede').textContent = `Newest first, in the server's time zone. Today is ${data.today}.`;
  table(
    $('daily'),
    ['Day', ...keys.map((k) => data.events[k])],
    data.daily.map((d) => [cell('td', d.day), ...keys.map((k) => num(d.counts[k] ?? 0))]),
  );
}

async function load(days) {
  for (const b of document.querySelectorAll('.range button')) b.setAttribute('aria-pressed', String(b.dataset.days === String(days)));
  try {
    const res = await fetch(`/admin/api/stats?days=${days}`, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    $('error').hidden = true;
    render(await res.json());
  } catch (e) {
    $('error').hidden = false;
    $('error').textContent = `Couldn’t load stats: ${e.message}`;
  }
}

for (const b of document.querySelectorAll('.range button')) b.addEventListener('click', () => load(Number(b.dataset.days)));
load(30);
