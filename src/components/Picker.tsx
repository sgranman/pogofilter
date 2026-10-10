import { useMemo, useState } from 'react';
import {
  GROUP_LABELS,
  IV_BARS,
  IV_STATS,
  KEYWORDS,
  MOVE_SLOTS,
  RANGES,
  STARS,
  TYPES,
  type KeywordGroup,
} from '../lib/catalog';
import { describe } from '../lib/describe';
import { searchSpecies, speciesTerm } from '../lib/species';
import { OPERATOR_CHARS, rangeText } from '../lib/syntax';
import Stamp from './Stamp';

type Tab = 'special' | 'iv' | 'numbers' | 'types' | 'moves' | 'pokemon' | 'more' | 'tags' | 'text';

const TABS: { id: Tab; label: string }[] = [
  { id: 'special', label: 'Special' },
  { id: 'iv', label: 'Stars & IVs' },
  { id: 'numbers', label: 'CP & dates' },
  { id: 'types', label: 'Types' },
  { id: 'pokemon', label: 'Pokémon' },
  { id: 'moves', label: 'Moves' },
  { id: 'more', label: 'Evolve & more' },
  { id: 'tags', label: 'Tags' },
  { id: 'text', label: 'Type it' },
];

interface Props {
  /** Starts the picker excluded (for "Keep safe"). */
  initialNot?: boolean;
  onPick: (text: string, not: boolean) => void;
}

export default function Picker({ initialNot = false, onPick }: Props) {
  const [tab, setTab] = useState<Tab>('special');
  const [not, setNot] = useState(initialNot);
  const pick = (text: string) => onPick(text, not);

  return (
    <div className="picker">
      <div className="seg" role="radiogroup" aria-label="Stamp as">
        <button type="button" role="radio" aria-checked={!not} className={!not ? 'is-on' : ''} onClick={() => setNot(false)}>
          Must match
        </button>
        <button type="button" role="radio" aria-checked={not} className={not ? 'is-on is-void' : ''} onClick={() => setNot(true)}>
          Must <em>not</em> match
        </button>
      </div>

      <div className="tabs" role="tablist" aria-label="Kinds of stamp">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'is-on' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="picker__panel" role="tabpanel">
        {tab === 'special' && <KeywordPanel groups={['special', 'size']} not={not} onPick={pick} />}
        {tab === 'more' && <KeywordPanel groups={['evolve', 'source', 'region', 'gender', 'other']} not={not} onPick={pick} />}
        {tab === 'iv' && <IvPanel not={not} onPick={pick} />}
        {tab === 'numbers' && <RangePanel onPick={pick} />}
        {tab === 'types' && <TypePanel not={not} onPick={pick} />}
        {tab === 'moves' && <MovePanel not={not} onPick={pick} />}
        {tab === 'pokemon' && <PokemonPanel not={not} onPick={pick} />}
        {tab === 'tags' && <TagPanel not={not} onPick={pick} />}
        {tab === 'text' && <TextPanel onPick={pick} />}
      </div>
    </div>
  );
}

interface PanelProps {
  not: boolean;
  onPick: (text: string) => void;
}

function Choices({ terms, not, onPick }: PanelProps & { terms: string[] }) {
  return (
    <div className="choices">
      {terms.map((text) => (
        <Stamp key={text} term={{ text, not }} onClick={() => onPick(text)} />
      ))}
    </div>
  );
}

function KeywordPanel({ groups, not, onPick }: PanelProps & { groups: KeywordGroup[] }) {
  return (
    <>
      {groups.map((g) => (
        <section key={g} className="picker__group">
          <h3>{GROUP_LABELS[g]}</h3>
          <Choices terms={KEYWORDS.filter((k) => k.group === g).map((k) => k.key)} not={not} onPick={onPick} />
        </section>
      ))}
    </>
  );
}

function IvPanel({ not, onPick }: PanelProps) {
  const [sel, setSel] = useState<Record<string, [number, number] | null>>({});
  const tap = (stat: string, n: number) =>
    setSel((s) => {
      const cur = s[stat];
      if (!cur || cur[0] !== cur[1]) return { ...s, [stat]: [n, n] };
      return { ...s, [stat]: [Math.min(cur[0], n), Math.max(cur[0], n)] };
    });

  return (
    <>
      <section className="picker__group">
        <h3>Appraisal stars</h3>
        <Choices terms={STARS.map((s) => `${s.n}*`)} not={not} onPick={onPick} />
      </section>
      <section className="picker__group">
        <h3>One stat</h3>
        <p className="hint">Tap a bar count, then another to stamp a span. Bars are 0 to 4, like the appraisal screen.</p>
        {IV_STATS.map((s) => {
          const r = sel[s.key];
          const text = r ? `${rangeText(r[0], r[1])}${s.key}` : null;
          return (
            <div key={s.key} className="ivrow">
              <span className="ivrow__name">{s.label}</span>
              <div className="bars" role="group" aria-label={`${s.label} bars`}>
                {IV_BARS.map((pts, n) => (
                  <button
                    key={n}
                    type="button"
                    className={r && n >= r[0] && n <= r[1] ? 'is-on' : ''}
                    aria-pressed={!!(r && n >= r[0] && n <= r[1])}
                    onClick={() => tap(s.key, n)}
                    title={`${pts} IV`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn--ink" disabled={!text} onClick={() => text && onPick(text)}>
                Stamp
              </button>
            </div>
          );
        })}
      </section>
    </>
  );
}

const RANGE_SHORTCUTS: Record<string, { label: string; text: string }[]> = {
  cp: [
    { label: 'Great League (≤ 1500)', text: 'cp-1500' },
    { label: 'Ultra League (≤ 2500)', text: 'cp-2500' },
    { label: '2500 and up', text: 'cp2500-' },
  ],
  age: [
    { label: 'Today', text: 'age0' },
    { label: 'Last 7 days', text: 'age0-6' },
  ],
  distance: [{ label: '100 km or more', text: 'distance100-' }],
  buddy: [
    { label: 'Never a buddy', text: 'buddy0' },
    { label: 'Good Buddy or better', text: 'buddy2-5' },
    { label: 'Best Buddy', text: 'buddy5' },
  ],
  mega: [{ label: 'Ever Mega Evolved', text: 'mega1-3' }],
};

function RangePanel({ onPick }: { onPick: (text: string) => void }) {
  const [prefix, setPrefix] = useState('cp');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const field = RANGES.find((r) => r.prefix === prefix)!;
  const lo = min === '' ? null : Number(min);
  const hi = max === '' ? null : Number(max);
  const valid = (lo != null || hi != null) && (lo == null || hi == null || lo <= hi);
  const text = valid ? `${prefix}${rangeText(lo, hi)}` : '';

  return (
    <>
      <div className="choices choices--plain" role="radiogroup" aria-label="What to measure">
        {RANGES.map((r) => (
          <button
            key={r.prefix}
            type="button"
            role="radio"
            aria-checked={prefix === r.prefix}
            className={`pill ${prefix === r.prefix ? 'is-on' : ''}`}
            onClick={() => {
              setPrefix(r.prefix);
              setMin('');
              setMax('');
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
      {prefix === 'age' && <AgeForm onPick={onPick} />}
      {RANGE_SHORTCUTS[prefix] && (
        <div className="choices choices--plain">
          {RANGE_SHORTCUTS[prefix].map((s) => (
            <button key={s.text} type="button" className="pill pill--quick" onClick={() => onPick(s.text)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
      {prefix === 'age' && <h3 className="picker__sub">Or an exact span of days since caught</h3>}
      <div className="rangeform">
        <label>
          <span>From</span>
          <input inputMode="numeric" pattern="[0-9]*" value={min} placeholder="any" onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} />
        </label>
        <span className="rangeform__dash" aria-hidden="true">
          –
        </span>
        <label>
          <span>To</span>
          <input inputMode="numeric" pattern="[0-9]*" value={max} placeholder="any" onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} />
        </label>
        <button type="button" className="btn btn--ink" disabled={!valid} onClick={() => onPick(text)}>
          Stamp
        </button>
      </div>
      <p className="hint">
        {field.hint}. {valid ? `Reads as: ${describe({ text, not: false }).gloss}.` : 'Leave one side empty for “or more” / “or less”.'}
      </p>
    </>
  );
}

/**
 * Plain-language age searches. The game counts whole days since the catch,
 * with `age0` meaning "less than a day ago", so the last N days is `age0-(N-1)`
 * and "more than N days ago" is `ageN-`.
 */
function AgeForm({ onPick }: { onPick: (text: string) => void }) {
  const [within, setWithin] = useState('');
  const [older, setOlder] = useState('');
  const w = Number(within);
  const o = Number(older);
  const withinText = within !== '' && w >= 1 ? (w === 1 ? 'age0' : `age0-${w - 1}`) : '';
  const olderText = older !== '' && o >= 1 ? `age${o}-` : '';
  return (
    <div className="ageform" role="group" aria-labelledby="age-h">
      <h3 id="age-h" className="ageform__head">
        Caught…
      </h3>
      <form
        className="sentence"
        onSubmit={(e) => {
          e.preventDefault();
          if (withinText) onPick(withinText);
        }}
      >
        <label htmlFor="age-within">in the last</label>
        <input
          id="age-within"
          inputMode="numeric"
          pattern="[0-9]*"
          value={within}
          placeholder="7"
          onChange={(e) => setWithin(e.target.value.replace(/\D/g, '').slice(0, 4))}
        />
        <span>days</span>
        <button type="submit" className="btn btn--ink" disabled={!withinText}>
          Stamp
        </button>
      </form>
      <form
        className="sentence"
        onSubmit={(e) => {
          e.preventDefault();
          if (olderText) onPick(olderText);
        }}
      >
        <label htmlFor="age-older">more than</label>
        <input
          id="age-older"
          inputMode="numeric"
          pattern="[0-9]*"
          value={older}
          placeholder="30"
          onChange={(e) => setOlder(e.target.value.replace(/\D/g, '').slice(0, 4))}
        />
        <span>days ago</span>
        <button type="submit" className="btn btn--ink" disabled={!olderText}>
          Stamp
        </button>
      </form>
    </div>
  );
}

function TypePanel({ not, onPick }: PanelProps) {
  const [mode, setMode] = useState<'' | '>' | '<'>('');
  return (
    <>
      <div className="choices choices--plain" role="radiogroup" aria-label="Type match">
        {(
          [
            ['', 'Is this type'],
            ['>', 'Strong against'],
            ['<', 'Weak to'],
          ] as const
        ).map(([m, label]) => (
          <button key={m} type="button" role="radio" aria-checked={mode === m} className={`pill ${mode === m ? 'is-on' : ''}`} onClick={() => setMode(m)}>
            {label}
          </button>
        ))}
      </div>
      <Choices terms={TYPES.map((t) => mode + t.key)} not={not} onPick={onPick} />
    </>
  );
}

function MovePanel({ not, onPick }: PanelProps) {
  const [slot, setSlot] = useState('');
  const [name, setName] = useState('');
  const clean = name.trim().toLowerCase();
  const nameOk = clean.length > 1 && !OPERATOR_CHARS.test(clean);
  return (
    <>
      <div className="choices choices--plain" role="radiogroup" aria-label="Which move">
        {MOVE_SLOTS.map((s) => (
          <button key={s.slot} type="button" role="radio" aria-checked={slot === s.slot} className={`pill ${slot === s.slot ? 'is-on' : ''}`} onClick={() => setSlot(s.slot)}>
            {s.label}
          </button>
        ))}
      </div>
      <section className="picker__group">
        <h3>Move type</h3>
        <Choices terms={TYPES.map((t) => `@${slot}${t.key}`)} not={not} onPick={onPick} />
      </section>
      <section className="picker__group">
        <h3>Special</h3>
        <Choices terms={[`@${slot}special`, `@${slot}weather`]} not={not} onPick={onPick} />
      </section>
      <section className="picker__group">
        <h3>A move by name</h3>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (nameOk) onPick(`@${slot}${clean}`);
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. shadow ball" aria-label="Move name" />
          <button type="submit" className="btn btn--ink" disabled={!nameOk}>
            Stamp
          </button>
        </form>
      </section>
    </>
  );
}

function PokemonPanel({ not, onPick }: PanelProps) {
  const [q, setQ] = useState('');
  const [family, setFamily] = useState(false);
  const [lo, setLo] = useState('');
  const [hi, setHi] = useState('');
  const results = useMemo(() => searchSpecies(q), [q]);
  const dexOk = lo !== '' || hi !== '';
  return (
    <>
      <label className="search">
        <span className="visually-hidden">Find a Pokémon</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or Pokédex number" autoComplete="off" />
      </label>
      <label className="check">
        <input type="checkbox" checked={family} onChange={(e) => setFamily(e.target.checked)} />
        <span>Whole evolution family</span>
      </label>
      {q && !results.length && <p className="hint">No Pokémon by that name.</p>}
      <div className="choices">
        {results.map((s) => (
          <Stamp key={s.n} term={{ text: speciesTerm(s, family), not }} onClick={() => onPick(speciesTerm(s, family))} />
        ))}
      </div>
      <section className="picker__group">
        <h3>Pokédex range</h3>
        <div className="rangeform">
          <label>
            <span>From #</span>
            <input inputMode="numeric" value={lo} placeholder="1" onChange={(e) => setLo(e.target.value.replace(/\D/g, ''))} />
          </label>
          <span className="rangeform__dash" aria-hidden="true">
            –
          </span>
          <label>
            <span>To #</span>
            <input inputMode="numeric" value={hi} placeholder="151" onChange={(e) => setHi(e.target.value.replace(/\D/g, ''))} />
          </label>
          <button
            type="button"
            className="btn btn--ink"
            disabled={!dexOk}
            onClick={() => onPick(rangeText(lo === '' ? null : Number(lo), hi === '' ? null : Number(hi)))}
          >
            Stamp
          </button>
        </div>
      </section>
    </>
  );
}

function TagPanel({ not, onPick }: PanelProps) {
  const [name, setName] = useState('');
  const clean = name.trim().replace(/^#/, '');
  const ok = clean.length > 0 && !OPERATOR_CHARS.test(clean);
  return (
    <>
      <Choices terms={['#']} not={not} onPick={onPick} />
      <p className="hint">“Any tag” matches every tagged Pokémon. Stamp it as “must not match” to keep your tagged Pokémon out of a cleanup.</p>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onPick(`#${clean}`);
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tag name, e.g. PvP" aria-label="Tag name" />
        <button type="submit" className="btn btn--ink" disabled={!ok}>
          Stamp
        </button>
      </form>
    </>
  );
}

function TextPanel({ onPick }: { onPick: (text: string) => void }) {
  const [text, setText] = useState('');
  const clean = text.trim().replace(/^!+/, '');
  const ok = clean.length > 0 && !OPERATOR_CHARS.test(clean);
  return (
    <>
      <p className="hint">One search term, typed exactly as the game expects it. Good for keywords Niantic added after this site was last updated.</p>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onPick(clean);
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. hatched" aria-label="Search term" autoCapitalize="off" />
        <button type="submit" className="btn btn--ink" disabled={!ok}>
          Stamp
        </button>
      </form>
      {text && !ok && <p className="hint hint--warn">A single term can’t contain &amp; , ; : | or !. Use separate stamps instead.</p>}
      {ok && <p className="hint">Reads as: {describe({ text: clean, not: false }).gloss}.</p>}
    </>
  );
}
