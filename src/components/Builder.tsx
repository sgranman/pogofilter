import { ArrowLeft, Bookmark, Link2, Plus, ShieldCheck, Trash2, TriangleAlert, Undo2 } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { describe, describeClause, isProtectClause } from '../lib/describe';
import { copyText, go } from '../lib/nav';
import { PRESET_BY_ID, PROTECT } from '../lib/presets';
import { shareUrl } from '../lib/share';
import { track } from '../lib/stats';
import { normalize, parse, serialize, type Expr, type Term } from '../lib/syntax';
import Picker from './Picker';
import Sheet from './Sheet';
import Stamp from './Stamp';
import Stub from './Stub';
import { toast } from './Toast';

export interface Draft {
  name: string;
  string: string;
  presetId?: string;
  fromShare?: boolean;
}

interface Props {
  draft: Draft;
  /** Set when editing a saved card; changes then save as you go. */
  savedId?: string;
  onChange?: (d: Draft) => void;
  onSave: (d: Draft) => string;
  onDelete?: () => void;
}

type SheetState =
  | { mode: 'add-station' }
  | { mode: 'add-or'; clause: number }
  | { mode: 'edit'; clause: number; term: number }
  | { mode: 'protect' }
  | { mode: 'text' }
  | null;

/** A single excluded term: shown in "Keep safe" rather than on the route. */
const isKeepSafe = (c: Term[]) => c.length === 1 && c[0].not;

export default function Builder({ draft, savedId, onChange, onSave, onDelete }: Props) {
  const [name, setName] = useState(draft.name);
  const [expr, setExpr] = useState<Expr>(() => parse(draft.string));
  const [sheet, setSheet] = useState<SheetState>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const preset = draft.presetId ? PRESET_BY_ID.get(draft.presetId) : undefined;
  const string = useMemo(() => serialize(expr), [expr]);
  const pristine = useRef(true);

  // One count per card opened: which suggestion, a share link, or a blank card.
  useEffect(() => {
    if (savedId) return;
    if (draft.presetId) track('preset', draft.presetId);
    else if (draft.fromShare) track('shared');
    else track('blank');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pristine.current) {
      pristine.current = false;
      return;
    }
    onChange?.({ ...draft, name, string });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, string]);

  const stations = expr.map((c, i) => ({ c, i })).filter(({ c }) => !isKeepSafe(c));
  const safe = expr.map((c, i) => ({ c, i })).filter(({ c }) => isKeepSafe(c));
  const safeKeys = new Set(safe.map(({ c }) => c[0].text.toLowerCase()));

  const mark = (clause: number, term: number) => setFresh(`${clause}:${term}:${Date.now()}`);

  const addStation = (text: string, not: boolean) => {
    setExpr((e) => [...e, [{ text, not }]]);
    mark(expr.length, 0);
  };
  const addOr = (clause: number, text: string, not: boolean) => {
    setExpr((e) => e.map((c, i) => (i === clause ? [...c, { text, not }] : c)));
    mark(clause, expr[clause].length);
  };
  const replaceTerm = (clause: number, term: number, t: Term) => {
    setExpr((e) => e.map((c, i) => (i === clause ? c.map((x, j) => (j === term ? t : x)) : c)));
    mark(clause, term);
  };
  const removeTerm = (clause: number, term: number) =>
    setExpr((e) => e.map((c, i) => (i === clause ? c.filter((_, j) => j !== term) : c)).filter((c) => c.length));
  const toggleSafe = (text: string) => {
    const at = expr.findIndex((c) => isKeepSafe(c) && c[0].text.toLowerCase() === text);
    if (at >= 0) setExpr((e) => e.filter((_, i) => i !== at));
    else {
      setExpr((e) => [...e, [{ text, not: true }]]);
      mark(expr.length, 0);
    }
  };
  const protectAll = () => {
    const missing = PROTECT.filter((t) => !safeKeys.has(t));
    setExpr((e) => [...e, ...missing.map((text) => [{ text, not: true }])]);
  };

  const save = () => {
    onSave({ ...draft, name, string });
    track('save', draft.presetId);
    toast('Saved to your cards on this device.');
  };

  const share = async () => {
    const url = shareUrl({ name, string });
    track('share');
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} · PoGoFilter`, url });
        return;
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return;
      }
    }
    toast((await copyText(url)) ? 'Link copied. The filter rides in the link itself.' : 'Couldn’t copy the link.');
  };

  const editing = sheet?.mode === 'edit' ? expr[sheet.clause]?.[sheet.term] : undefined;
  const sentence = expr.length ? describeSentence(expr) : '';

  return (
    <div className="page page--builder">
      <header className="topbar">
        <button type="button" className="icon-btn icon-btn--ground" onClick={() => go('#/')} aria-label="Back to all cards">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div className="topbar__actions">
          {!savedId && (
            <button type="button" className="btn btn--ground" onClick={save}>
              <Bookmark aria-hidden="true" /> Save
            </button>
          )}
          <button type="button" className="icon-btn icon-btn--ground" onClick={share} aria-label="Share as a link" disabled={!string}>
            <Link2 aria-hidden="true" />
          </button>
          {onDelete && (
            <button
              type="button"
              className="icon-btn icon-btn--ground"
              onClick={onDelete}
              aria-label="Delete this card"
            >
              <Trash2 aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <article className="card rally" aria-label={`Card: ${name}`}>
        <span className="rally__hole" aria-hidden="true" />
        <label className="rally__name">
          <span className="visually-hidden">Card name</span>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 80))} placeholder="Name this card" enterKeyHint="done" />
        </label>
        {preset && <p className="rally__blurb">{preset.blurb}</p>}
        {draft.fromShare && !savedId && <p className="note">Someone shared this card with you. Save it to keep it on this device.</p>}
        {preset?.destructive && (
          <p className="note note--warn">
            <TriangleAlert aria-hidden="true" />
            <span>
              Built for mass transfer. Scroll the results in the game before you transfer anything. Transfers can’t be undone.
            </span>
          </p>
        )}
        {preset?.tip && <p className="note">{preset.tip}</p>}

        <ol className="route" aria-label="Rules. Pokémon must match every one">
          {stations.map(({ c, i }, n) => (
            <Fragment key={i}>
              {n > 0 && (
                <li className="route__and" aria-hidden="true">
                  and
                </li>
              )}
              <li className="station">
                <span className="station__dot station__dot--stamped" aria-hidden="true" />
                <div className="station__stamps">
                  {c.map((t, j) => (
                    <Fragment key={j}>
                      {j > 0 && <span className="station__or">or</span>}
                      <Stamp
                        term={t}
                        fresh={!!fresh?.startsWith(`${i}:${j}:`)}
                        onClick={() => setSheet({ mode: 'edit', clause: i, term: j })}
                      />
                    </Fragment>
                  ))}
                  <button type="button" className="add-or" onClick={() => setSheet({ mode: 'add-or', clause: i })}>
                    <Plus aria-hidden="true" />
                    or…
                  </button>
                </div>
                <p className="station__gloss">{capitalize(describeClause(c))}</p>
              </li>
            </Fragment>
          ))}
          <li className="station station--add">
            <span className="station__dot" aria-hidden="true" />
            <button type="button" className="add-station" onClick={() => setSheet({ mode: 'add-station' })}>
              <Plus aria-hidden="true" />
              {stations.length ? 'And also…' : 'Stamp your first rule'}
            </button>
          </li>
        </ol>

        <section className="safe" aria-labelledby="safe-h">
          <div className="safe__head">
            <h2 id="safe-h">
              <ShieldCheck aria-hidden="true" /> Keep safe
            </h2>
            {PROTECT.some((t) => !safeKeys.has(t)) && (
              <button type="button" className="link-btn" onClick={protectAll}>
                Protect all
              </button>
            )}
          </div>
          <p className="safe__lede">Anything matching a red stamp never shows up. Tap to stamp or unstamp.</p>
          <div className="safe__grid">
            {safe
              .filter(({ c }) => !PROTECT.includes(c[0].text.toLowerCase()))
              .map(({ c, i }) => (
                <Stamp key={i} term={c[0]} fresh={!!fresh?.startsWith(`${i}:0:`)} onClick={() => setSheet({ mode: 'edit', clause: i, term: 0 })} />
              ))}
            {PROTECT.map((t) =>
              safeKeys.has(t) ? (
                <Stamp
                  key={t}
                  term={{ text: t, not: true }}
                  fresh={!!fresh && expr.findIndex((c) => isKeepSafe(c) && c[0].text.toLowerCase() === t) === Number(fresh.split(':')[0])}
                  onClick={() => toggleSafe(t)}
                />
              ) : (
                <button key={t} type="button" className="ghost" onClick={() => toggleSafe(t)} aria-label={`Keep ${describe({ text: t, not: false }).gloss} Pokémon safe`}>
                  {describe({ text: t, not: false }).label}
                </button>
              ),
            )}
            <button type="button" className="ghost ghost--more" onClick={() => setSheet({ mode: 'protect' })}>
              <Plus aria-hidden="true" /> Other
            </button>
          </div>
        </section>

        {sentence && (
          <footer className="rally__reads">
            <h2>Reads as</h2>
            <p>{sentence}</p>
          </footer>
        )}
      </article>

      <Stub
        value={string}
        meta={metaLine(stations.length, safe.length, string.length)}
        onCopied={() => track('copy', draft.presetId)}
        onEditText={() => {
          setRawText(string);
          setSheet({ mode: 'text' });
        }}
      />

      <Sheet
        open={!!sheet}
        onClose={() => setSheet(null)}
        title={
          sheet?.mode === 'edit'
            ? 'Change stamp'
            : sheet?.mode === 'add-or'
              ? 'Or also match…'
              : sheet?.mode === 'protect'
                ? 'Keep safe'
                : sheet?.mode === 'text'
                  ? 'Edit as text'
                  : 'Stamp a rule'
        }
      >
        {sheet?.mode === 'add-station' && (
          <Picker
            onPick={(t, not) => {
              addStation(t, not);
              setSheet(null);
            }}
          />
        )}
        {sheet?.mode === 'add-or' && (
          <Picker
            onPick={(t, not) => {
              addOr(sheet.clause, t, not);
              setSheet(null);
            }}
          />
        )}
        {sheet?.mode === 'protect' && (
          <Picker
            initialNot
            onPick={(t, not) => {
              addStation(t, not);
              setSheet(null);
            }}
          />
        )}
        {sheet?.mode === 'edit' && editing && (
          <>
            <div className="editing">
              <Stamp term={editing} />
              <p>Matches Pokémon: {describe(editing).gloss}.</p>
              {describe(editing).warning && <p className="hint hint--warn">{describe(editing).warning}</p>}
              <div className="editing__actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => replaceTerm(sheet.clause, sheet.term, { ...editing, not: !editing.not })}
                >
                  <Undo2 aria-hidden="true" />
                  {editing.not ? 'Make it “must match”' : 'Make it “must not match”'}
                </button>
                <button
                  type="button"
                  className="btn btn--void"
                  onClick={() => {
                    removeTerm(sheet.clause, sheet.term);
                    setSheet(null);
                  }}
                >
                  <Trash2 aria-hidden="true" /> Remove
                </button>
              </div>
            </div>
            <h3 className="sheet__sub">Or swap it for</h3>
            <Picker
              initialNot={editing.not}
              onPick={(t, not) => {
                replaceTerm(sheet.clause, sheet.term, { text: t, not });
                setSheet(null);
              }}
            />
          </>
        )}
        {sheet?.mode === 'text' && (
          <form
            className="rawform"
            onSubmit={(e) => {
              e.preventDefault();
              setExpr(parse(rawText));
              setSheet(null);
            }}
          >
            <p className="hint">
              Paste or type a search string. <code>&amp;</code> means “and”, <code>,</code> means “or”, and <code>!</code> means “not”.
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={5}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label="Search string"
            />
            <p className="hint">
              {normalize(rawText) === string ? 'No changes yet.' : `Becomes ${parse(rawText).length} rule${parse(rawText).length === 1 ? '' : 's'}.`}
            </p>
            <button type="submit" className="btn btn--ink btn--wide">
              Use this string
            </button>
          </form>
        )}
      </Sheet>
    </div>
  );
}

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function metaLine(rules: number, safe: number, chars: number): string[] {
  const parts = [`${rules} rule${rules === 1 ? '' : 's'}`];
  if (safe) parts.push(`${safe} kept safe`);
  parts.push(`${chars} chars`);
  return parts;
}

function describeSentence(expr: Expr): string {
  const rules = expr.filter((c) => !isProtectClause(c) || c.length > 1).map(describeClause);
  const safe = expr.filter((c) => isProtectClause(c) && c.length === 1).map((c) => describe({ ...c[0], not: false }).gloss);
  let s = rules.length ? `Shows Pokémon ${rules.map((r) => `(${r})`).join(' and ')}.` : 'Shows every Pokémon.';
  if (safe.length) {
    const list = safe.length > 1 ? `${safe.slice(0, -1).join(', ')} or ${safe.at(-1)}` : safe[0];
    s += ` Never shows any that are ${list}.`;
  }
  return s;
}
