import { Ban } from 'lucide-react';
import type { CSSProperties } from 'react';
import { describe } from '../lib/describe';
import { inkFor, inkText, tilt } from '../lib/ink';
import type { Term } from '../lib/syntax';

interface Props {
  term: Term;
  onClick?: () => void;
  /** Plays the landing motion once; set on freshly added stamps. */
  fresh?: boolean;
  small?: boolean;
}

/**
 * One term, inked like a rally stamp. Included terms are solid ink; excluded
 * (`!`) terms are hollow void-red rings, a different class at a glance.
 */
export default function Stamp({ term, onClick, fresh, small }: Props) {
  const d = describe(term);
  const ink = inkFor(d, term.text);
  const style = {
    '--ink': term.not ? 'var(--void)' : ink,
    '--ink-text': term.not ? 'var(--void)' : inkText(ink),
    '--tilt': `${tilt(term.text)}deg`,
  } as CSSProperties;
  const cls = ['stamp', term.not ? 'stamp--void' : 'stamp--solid', fresh && 'stamp--fresh', small && 'stamp--small']
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      <span className="stamp__ink" aria-hidden="true" />
      {term.not && <Ban className="stamp__ban" aria-hidden="true" strokeWidth={2.75} />}
      <span className="stamp__label">{d.label}</span>
    </>
  );
  const name = `${term.not ? 'Not ' : ''}${d.label}: ${d.gloss}`;
  return onClick ? (
    <button type="button" className={cls} style={style} onClick={onClick} aria-label={`${name}. Edit`}>
      {content}
    </button>
  ) : (
    <span className={cls} style={style} title={d.gloss} aria-label={name} role="img">
      {content}
    </span>
  );
}
