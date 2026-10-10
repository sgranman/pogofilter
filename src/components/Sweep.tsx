import { ArrowLeft, Copy, RotateCcw, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { copyText, go } from '../lib/nav';
import { searchSpecies } from '../lib/species';
import { track } from '../lib/stats';
import {
  cleanTag,
  loadSweeps,
  saveSweeps,
  sweepSteps,
  targetFor,
  targetFromTerm,
  targetLabel,
  type SweepTarget,
  STEP_COUNT,
} from '../lib/sweep';
import { toast } from './Toast';

interface Props {
  /** The species term from the route, e.g. `+eevee`; absent on the picker screen. */
  term?: string;
}

/**
 * Advanced: pare back one Pokémon at a time. A stamp-rally route where each
 * station is one search to paste, and gets stamped when it's done.
 */
export default function Sweep({ term }: Props) {
  const target = useMemo(() => (term ? targetFromTerm(term) : null), [term]);
  return (
    <div className="page page--sweep">
      <header className="topbar">
        <button
          type="button"
          className="icon-btn icon-btn--ground"
          onClick={() => go(target ? '#/sweep' : '#/')}
          aria-label={target ? 'Pick another Pokémon' : 'Back to all cards'}
        >
          <ArrowLeft aria-hidden="true" />
        </button>
      </header>
      {target ? <Route target={target} /> : <Choose missing={!!term} />}
    </div>
  );
}

function Choose({ missing }: { missing: boolean }) {
  const [q, setQ] = useState('');
  const [family, setFamily] = useState(false);
  const results = useMemo(() => searchSpecies(q), [q]);
  const recent = useMemo(
    () =>
      Object.values(loadSweeps().sweeps)
        .sort((a, b) => b.at - a.at)
        .slice(0, 12),
    [],
  );

  const start = (t: SweepTarget) => {
    track('sweep');
    go(`#/sweep/${encodeURIComponent(t.term)}`);
  };

  return (
    <article className="card rally">
      <span className="rally__hole" aria-hidden="true" />
      <h1 className="rally__title">Species sweep</h1>
      <p className="rally__blurb">
        Pare back one Pokémon at a time. Keep the best few of each special kind, then transfer the rest. Each step is a
        search to paste, and you can sweep the same Pokémon again later to swap in better ones.
      </p>
      {missing && <p className="note">That Pokémon isn’t in PoGoFilter’s list. Pick it again below.</p>}

      <label className="search">
        <span className="visually-hidden">Find a Pokémon</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or Pokédex number" autoComplete="off" />
      </label>
      <label className="check">
        <input type="checkbox" checked={family} onChange={(e) => setFamily(e.target.checked)} />
        <span>Whole evolution family</span>
      </label>
      {q && !results.length && <p className="hint">No Pokémon by that name.</p>}
      {results.length > 0 && (
        <ul className="picklist">
          {results.map((s) => (
            <li key={s.n}>
              <button type="button" className="picklist__item" onClick={() => start(targetFor(s, family))}>
                <span>{family ? `${s.name} family` : s.name}</span>
                <span className="picklist__num">#{s.n}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {recent.length > 0 && (
        <section className="recent" aria-labelledby="recent-h">
          <h2 id="recent-h">Recent sweeps</h2>
          <ul className="picklist">
            {recent.map((r) => (
              <li key={r.term}>
                <a className="picklist__item" href={`#/sweep/${encodeURIComponent(r.term)}`}>
                  <span>{r.label}</span>
                  <span className="picklist__num">
                    {r.done.length}/{STEP_COUNT} · {new Date(r.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Route({ target }: { target: SweepTarget }) {
  const [state, setState] = useState(loadSweeps);
  const [fresh, setFresh] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState(state.options.tag);
  const record = state.sweeps[target.term];
  const done = new Set(record?.done ?? []);
  const steps = sweepSteps(target, state.options);
  const label = targetLabel(target);

  useEffect(() => saveSweeps(state), [state]);

  const setDone = (id: string, on: boolean) => {
    setState((s) => {
      const prev = s.sweeps[target.term]?.done ?? [];
      const next = on ? [...new Set([...prev, id])] : prev.filter((d) => d !== id);
      return { ...s, sweeps: { ...s.sweeps, [target.term]: { term: target.term, label, done: next, at: Date.now() } } };
    });
    if (on) setFresh(`${id}:${Date.now()}`);
  };

  const copy = async (id: string, text: string, final?: boolean) => {
    if (!(await copyText(text))) {
      toast('Couldn’t reach the clipboard. Long-press the search to copy it.');
      return;
    }
    track('copy', `sweep-${id}`);
    setDone(id, true);
    toast(final ? 'Copied. Scroll the whole list in the game before transferring.' : 'Copied. Paste it into Pokémon GO.');
  };

  const reset = () =>
    setState((s) => {
      const sweeps = { ...s.sweeps };
      delete sweeps[target.term];
      return { ...s, sweeps };
    });

  return (
    <article className="card rally" aria-label={`Sweep: ${label}`}>
      <span className="rally__hole" aria-hidden="true" />
      <h1 className="rally__title">{label} sweep</h1>
      <p className="rally__blurb">
        Paste each search, decide in the game, then come back for the next one. The last step shows everything you didn’t tag.
      </p>

      <div className="sweepopts">
        <label className="sweepopts__tag">
          <span>Keep tag</span>
          <span className="sweepopts__hash" aria-hidden="true">
            #
          </span>
          <input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onBlur={() => {
              const tag = cleanTag(tagDraft);
              setTagDraft(tag);
              setState((s) => ({ ...s, options: { ...s.options, tag } }));
            }}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={state.options.protectAllTags}
            onChange={(e) => setState((s) => ({ ...s, options: { ...s.options, protectAllTags: e.target.checked } }))}
          />
          <span>Last step also keeps Pokémon with any other tag</span>
        </label>
      </div>

      <ol className="route route--sweep" aria-label="Steps">
        {steps.map((step, n) => {
          const isDone = done.has(step.id);
          return (
            <li key={step.id} className={`station step ${isDone ? 'is-done' : ''} ${step.final ? 'step--final' : ''}`}>
              <button
                type="button"
                className={`station__dot step__dot ${isDone ? 'station__dot--stamped' : ''} ${fresh?.startsWith(`${step.id}:`) ? 'step__dot--fresh' : ''}`}
                aria-pressed={isDone}
                aria-label={`Step ${n + 1}, ${step.title}: ${isDone ? 'done. Tap to undo' : 'mark done'}`}
                onClick={() => setDone(step.id, !isDone)}
              />
              <div className="step__body">
                <h2 className="step__title">{step.title}</h2>
                <p className="step__tip">
                  {step.final && <TriangleAlert aria-hidden="true" />}
                  {step.tip}
                </p>
                <div className="step__row">
                  <code className="step__string">{step.string}</code>
                  <button type="button" className="copy copy--small" onClick={() => copy(step.id, step.string, step.final)}>
                    <Copy aria-hidden="true" strokeWidth={2.5} />
                    Copy
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="sweepfoot">
        <span>
          {done.size} of {steps.length} stamped
          {record ? ` · last worked ${new Date(record.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}
        </span>
        {done.size > 0 && (
          <button type="button" className="link-btn link-btn--quiet" onClick={reset}>
            <RotateCcw aria-hidden="true" /> Start over
          </button>
        )}
      </footer>
    </article>
  );
}
