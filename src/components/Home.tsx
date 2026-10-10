import { Copy, Download, Plus, TriangleAlert, Upload } from 'lucide-react';
import { useRef } from 'react';
import { copyText, go } from '../lib/nav';
import { PRESET_GROUPS, PRESETS } from '../lib/presets';
import { exportCards, importCards, type SavedCard } from '../lib/storage';
import { parse } from '../lib/syntax';
import Stamp from './Stamp';
import { toast } from './Toast';

interface Props {
  cards: SavedCard[];
  onCards: (cards: SavedCard[]) => void;
  /** Arrived from a link to a card this browser doesn't have. */
  missing?: boolean;
}

export default function Home({ cards, onCards, missing }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const quickCopy = async (s: string, name: string) =>
    toast((await copyText(s)) ? `Copied “${name}”. Paste it into Pokémon GO.` : 'Couldn’t reach the clipboard. Open the card to copy.');

  const doExport = () => {
    const blob = new Blob([exportCards(cards)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pogofilter-cards-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const doImport = async (file: File) => {
    try {
      const r = importCards(cards, await file.text());
      onCards(r.cards);
      toast(r.added ? `Added ${r.added} card${r.added === 1 ? '' : 's'}${r.skipped ? `, skipped ${r.skipped} you already had` : ''}.` : 'Nothing new in that file.');
    } catch {
      toast('That file isn’t a PoGoFilter backup.');
    }
  };

  return (
    <div className="page page--home">
      <header className="masthead">
        <h1 className="wordmark">PoGoFilter</h1>
        <p className="masthead__lede">Search strings for your Pokémon GO storage. Stamp the rules, copy, paste into the game.</p>
      </header>

      {missing && <p className="note note--ground">That card isn’t saved in this browser. Cards live only on the device that made them.</p>}

      <section className="mine" aria-labelledby="mine-h">
        <div className="section-head">
          <h2 id="mine-h">Your cards</h2>
          <button type="button" className="btn btn--yellow" onClick={() => go('#/new')}>
            <Plus aria-hidden="true" strokeWidth={2.75} /> Blank card
          </button>
        </div>
        {cards.length ? (
          <ul className="tickets">
            {cards.map((c) => (
              <li key={c.id} className="ticket">
                <a href={`#/card/${c.id}`} className="ticket__open">
                  <span className="ticket__name">{c.name}</span>
                  <code className="ticket__string">{c.string || 'Blank'}</code>
                </a>
                <button type="button" className="ticket__copy" onClick={() => quickCopy(c.string, c.name)} disabled={!c.string} aria-label={`Copy ${c.name}`}>
                  <Copy aria-hidden="true" strokeWidth={2.5} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <p>
              No saved cards yet. Open a suggestion below, adjust it, and tap <strong>Save</strong>. It’ll wait here next time, on this
              device only.
            </p>
            <ol className="howto">
              <li>Pick or build a card</li>
              <li>Tap Copy</li>
              <li>In Pokémon GO, open your Pokémon and paste into Search</li>
            </ol>
          </div>
        )}
      </section>

      <section className="suggest" aria-labelledby="suggest-h">
        <h2 id="suggest-h" className="suggest__title">
          Start from a suggestion
        </h2>
        {PRESET_GROUPS.map((g) => (
          <section key={g.id} className="rail" aria-labelledby={`rail-${g.id}`}>
            <div className="rail__head">
              <h3 id={`rail-${g.id}`}>{g.label}</h3>
              <p>{g.blurb}</p>
            </div>
            <ul className="rail__track">
              {PRESETS.filter((p) => p.group === g.id).map((p) => {
                const expr = parse(p.string);
                const isSafe = (c: (typeof expr)[number]) => c.length === 1 && c[0].not;
                const rules = expr.filter((c) => !isSafe(c)).flat();
                // A pure cleanup card has only keep-safe stamps; show a few of those instead.
                const shown = rules.length ? rules : expr.flat();
                const safe = rules.length ? expr.filter(isSafe).length : expr.length - Math.min(4, expr.length);
                return (
                  <li key={p.id}>
                    <a className="mini" href={`#/preset/${p.id}`}>
                      <span className="mini__hole" aria-hidden="true" />
                      <span className="mini__name">{p.name}</span>
                      <span className="mini__blurb">{p.blurb}</span>
                      <span className="mini__stamps">
                        {shown.slice(0, 4).map((t, i) => (
                          <Stamp key={i} term={t} small />
                        ))}
                        {safe > 0 && <span className="mini__safe">+{safe}{rules.length ? ' kept safe' : ' more'}</span>}
                      </span>
                      {p.destructive && (
                        <span className="mini__warn">
                          <TriangleAlert aria-hidden="true" /> For transfers
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </section>

      <footer className="colophon">
        <div className="colophon__backup">
          <button type="button" className="btn btn--ground" onClick={doExport} disabled={!cards.length}>
            <Download aria-hidden="true" /> Back up cards
          </button>
          <button type="button" className="btn btn--ground" onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden="true" /> Restore
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = '';
            }}
          />
        </div>
        <p>
          No accounts, no tracking. Your cards are stored in this browser and never sent anywhere. Share links carry the filter after the{' '}
          <code>#</code>, which browsers don’t send to servers.
        </p>
        <p>
          Fan-made and unofficial. Not affiliated with Niantic, Nintendo, Creatures, GAME FREAK or The Pokémon Company. Pokémon and
          Pokémon GO are trademarks of their respective owners. Search keywords change. If one stops working,{' '}
          <a href="https://github.com/sgranman/pogofilter/issues">tell us on GitHub</a>.
        </p>
      </footer>
    </div>
  );
}
