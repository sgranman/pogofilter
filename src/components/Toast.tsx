import { useEffect, useState } from 'react';

interface Action {
  label: string;
  run: () => void;
}
interface Msg {
  id: number;
  text: string;
  action?: Action;
}

let push: (m: Msg) => void = () => {};
let seq = 0;

export function toast(text: string, action?: Action) {
  push({ id: ++seq, text, action });
}

export function Toaster() {
  const [msg, setMsg] = useState<Msg | null>(null);

  useEffect(() => {
    push = setMsg;
    return () => {
      push = () => {};
    };
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), msg.action ? 6000 : 3200);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <div className="toaster" role="status" aria-live="polite">
      {msg && (
        <div className="toast" key={msg.id}>
          <span>{msg.text}</span>
          {msg.action && (
            <button
              type="button"
              onClick={() => {
                msg.action!.run();
                setMsg(null);
              }}
            >
              {msg.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
