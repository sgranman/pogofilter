import { useCallback, useEffect, useMemo, useState } from 'react';
import Builder, { type Draft } from './components/Builder';
import Home from './components/Home';
import InkDefs from './components/InkDefs';
import { Toaster, toast } from './components/Toast';
import { go } from './lib/nav';
import { PRESET_BY_ID } from './lib/presets';
import { readShared } from './lib/share';
import { trackOpen } from './lib/stats';
import { loadCards, newId, saveCards, type SavedCard } from './lib/storage';

// Routes live in the URL fragment, which never reaches the server:
//   #/                 home
//   #/card/<id>        a saved card
//   #/preset/<id>      a fresh copy of a suggestion
//   #/new?s=…&n=…      a blank card, or one opened from a share link
type Route =
  | { view: 'home' }
  | { view: 'card'; id: string }
  | { view: 'new'; draft: Draft };

function routeFrom(hash: string): Route {
  let m = /^#\/card\/([\w-]+)$/.exec(hash);
  if (m) return { view: 'card', id: m[1] };
  m = /^#\/preset\/([\w-]+)$/.exec(hash);
  if (m) {
    const p = PRESET_BY_ID.get(m[1]);
    if (p) return { view: 'new', draft: { name: p.name, string: p.string, presetId: p.id } };
  }
  if (hash.startsWith('#/new')) {
    const shared = readShared(hash);
    return { view: 'new', draft: shared ? { ...shared, fromShare: true } : { name: 'New card', string: '' } };
  }
  return { view: 'home' };
}

export default function App() {
  const [hash, setHash] = useState(location.hash);
  const [cards, setCards] = useState<SavedCard[]>(loadCards);

  useEffect(trackOpen, []);

  useEffect(() => {
    const on = () => setHash(location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  // Another tab saving cards shouldn't leave this one stale.
  useEffect(() => {
    const on = (e: StorageEvent) => e.key?.startsWith('pogofilter:') && setCards(loadCards());
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, []);

  const commit = useCallback((next: SavedCard[]) => {
    setCards(next);
    if (!saveCards(next)) toast('This browser won’t let PoGoFilter save. Private browsing, maybe?');
  }, []);

  const route = useMemo(() => routeFrom(hash), [hash]);

  const pageKey = route.view === 'card' ? `card:${route.id}` : route.view;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageKey]);

  const saveDraft = (d: Draft): string => {
    const now = Date.now();
    const card: SavedCard = {
      id: newId(),
      name: d.name.trim() || 'Untitled card',
      string: d.string,
      presetId: d.presetId,
      createdAt: now,
      updatedAt: now,
    };
    commit([card, ...cards]);
    go(`#/card/${card.id}`, true);
    return card.id;
  };

  const updateCard = (id: string, patch: Partial<SavedCard>) =>
    commit(cards.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)));

  const deleteCard = (id: string) => {
    const gone = cards.find((c) => c.id === id);
    commit(cards.filter((c) => c.id !== id));
    go('#/', true);
    if (gone) toast(`Deleted “${gone.name}”.`, { label: 'Undo', run: () => commit([gone, ...loadCards()]) });
  };

  let page;
  if (route.view === 'card') {
    const card = cards.find((c) => c.id === route.id);
    page = card ? (
      <Builder
        key={card.id}
        draft={{ name: card.name, string: card.string, presetId: card.presetId }}
        savedId={card.id}
        onChange={(d) => updateCard(card.id, { name: d.name, string: d.string })}
        onSave={saveDraft}
        onDelete={() => deleteCard(card.id)}
      />
    ) : (
      <Home cards={cards} onCards={commit} missing />
    );
  } else if (route.view === 'new') {
    page = <Builder key={hash} draft={route.draft} onSave={saveDraft} />;
  } else {
    page = <Home cards={cards} onCards={commit} />;
  }

  return (
    <>
      <InkDefs />
      {page}
      <Toaster />
    </>
  );
}
