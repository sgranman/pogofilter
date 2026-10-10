import { Copy, PencilLine } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { copyText } from '../lib/nav';
import { toast } from './Toast';

interface Props {
  value: string;
  /** Segments like "4 rules", "34 chars"; each stays on one line. */
  meta: string[];
  onEditText: () => void;
  onCopied?: () => void;
}

/**
 * The torn-off ticket stub pinned to the thumb zone. Its string area has a
 * fixed height, so the string changes in place and nothing on the page jumps.
 */
export default function Stub({ value, meta, onEditText, onCopied }: Props) {
  const [copied, setCopied] = useState(0);
  const [overflows, setOverflows] = useState(false);
  const scroller = useRef<HTMLSpanElement>(null);

  // Fade the last line only when there is more string below it.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) setOverflows(el.scrollHeight - el.scrollTop > el.clientHeight + 1);
  }, [value]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(0), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    if (!value) return;
    if (await copyText(value)) {
      setCopied(Date.now());
      onCopied?.();
    } else toast('Couldn’t reach the clipboard. Long-press the string to copy it.');
  };

  return (
    <div className="stub" role="region" aria-label="Search string">
      <div className="stub__inner">
        <button type="button" className="stub__string" onClick={onEditText} aria-label="Edit the search string as text">
          <span
            ref={scroller}
            className={`stub__scroll ${overflows ? 'stub__scroll--more' : ''}`}
            onScroll={(e) => {
              const el = e.currentTarget;
              setOverflows(el.scrollHeight - el.scrollTop > el.clientHeight + 1);
            }}
          >
            {value ? <code>{value}</code> : <span className="stub__empty">Stamp a rule to start your search string</span>}
          </span>
          <PencilLine className="stub__edit" aria-hidden="true" />
        </button>
        <div className="stub__row">
          <span className="stub__meta">
            {meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </span>
          <button type="button" className="copy" onClick={copy} disabled={!value}>
            <Copy aria-hidden="true" strokeWidth={2.5} />
            Copy
          </button>
        </div>
      </div>
      {copied > 0 && (
        <span className="copied" key={copied} aria-hidden="true">
          Copied!
        </span>
      )}
      <span className="visually-hidden" aria-live="polite">
        {copied > 0 ? 'Copied. Paste it into the search bar in Pokémon GO.' : ''}
      </span>
    </div>
  );
}
