import { useEffect, useRef, useState } from 'react';

/**
 * Two animated code panels for the registration walkthrough:
 *  - registry.json: the entry appends line-by-line, new lines flash a highlight
 *  - terminal: git commands type out with a blinking cursor
 *
 * Animation runs once when scrolled into view. Honors prefers-reduced-motion
 * (renders the final state instantly). Self-contained — no GSAP dependency.
 */

interface Props {
  json: string;
  flow: string;
}

const TrafficLights = () => (
  <span className="flex gap-1.5" aria-hidden="true">
    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
  </span>
);

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** Fires `onEnter` once when the element first crosses into view. */
function useInView<T extends HTMLElement>(onEnter: () => void) {
  const ref = useRef<T>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !fired.current) {
            fired.current = true;
            onEnter();
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onEnter]);
  return ref;
}

/* ---------------------------------------------------------------- */
/*  registry.json — reveals line by line, new lines flash highlight  */
/* ---------------------------------------------------------------- */

function JsonPanel({ json, reduced }: { json: string; reduced: boolean }) {
  const lines = json.split('\n');
  // The "new" lines are the inner key/value pairs (everything but the braces).
  const isNew = (i: number) => i !== 0 && i !== lines.length - 1;
  // Start fully shown so SSR / no-JS renders complete content. The client
  // collapses to 0 (in an effect) only when it's actually going to animate.
  const [shown, setShown] = useState(lines.length);

  useEffect(() => {
    if (!reduced) setShown(0);
  }, [reduced, lines.length]);

  const start = () => {
    if (reduced) return;
    let i = 0;
    const tick = () => {
      i += 1;
      setShown(i);
      if (i < lines.length) {
        // braces appear fast; key lines a touch slower for readability
        window.setTimeout(tick, isNew(i) ? 130 : 60);
      }
    };
    window.setTimeout(tick, 250);
  };

  const ref = useInView<HTMLDivElement>(start);

  return (
    <figure className="overflow-hidden rounded-2xl border-[1.5px] border-ink bg-ink">
      <figcaption className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <TrafficLights />
        <span className="ml-2 font-mono text-xs text-white/50">registry.json</span>
      </figcaption>
      <div ref={ref} className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed">
        <pre className="min-h-[17rem]">
          {lines.map((line, i) => {
            const visible = i < shown;
            const justAdded = visible && isNew(i);
            return (
              <div
                key={i}
                className="transition-colors duration-700"
                style={{
                  opacity: visible ? 1 : 0,
                  color: 'rgba(255,255,255,0.85)',
                  // brief saffron flash on the freshly-added line, then settle
                  background:
                    justAdded && i === shown - 1
                      ? 'color-mix(in oklab, #FF9505 28%, transparent)'
                      : 'transparent',
                  borderRadius: '4px',
                }}
              >
                {line === '' ? ' ' : line}
              </div>
            );
          })}
        </pre>
      </div>
    </figure>
  );
}

/* ---------------------------------------------------------------- */
/*  terminal — types commands out with a blinking cursor             */
/* ---------------------------------------------------------------- */

function TerminalPanel({ flow, reduced }: { flow: string; reduced: boolean }) {
  // Start with full text so SSR / no-JS shows the commands. Client clears it
  // (in an effect) only when it's about to type.
  const [text, setText] = useState(flow);
  const [done, setDone] = useState(true);

  useEffect(() => {
    if (!reduced) {
      setText('');
      setDone(false);
    }
  }, [reduced, flow]);

  const start = () => {
    if (reduced) return;
    let i = 0;
    const tick = () => {
      // Reveal a few chars per frame; jump whitespace fast so it feels snappy.
      const step = 2 + Math.floor(Math.random() * 3);
      i = Math.min(flow.length, i + step);
      setText(flow.slice(0, i));
      if (i < flow.length) {
        const ch = flow[i] ?? '';
        window.setTimeout(tick, ch === '\n' ? 90 : 18);
      } else {
        setDone(true);
      }
    };
    window.setTimeout(tick, 400);
  };

  const ref = useInView<HTMLDivElement>(start);

  return (
    <figure className="overflow-hidden rounded-2xl border-[1.5px] border-ink bg-ink">
      <figcaption className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-xs text-white/50">terminal — the PR flow</span>
      </figcaption>
      <div ref={ref} className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed">
        <pre className="min-h-[11rem]" style={{ color: '#7fe7ff' }}>
          {text}
          <span
            aria-hidden="true"
            className="cursor-blink"
            style={{
              display: 'inline-block',
              width: '0.55em',
              height: '1.05em',
              transform: 'translateY(0.18em)',
              background: '#7fe7ff',
              opacity: done ? 0 : 1,
            }}
          />
        </pre>
      </div>
      <style>{`
        @keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        .cursor-blink { animation: blink 1s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cursor-blink { animation: none; opacity: 0 !important; }
        }
      `}</style>
    </figure>
  );
}

export default function CodeDemo({ json, flow }: Props) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="space-y-5">
      <JsonPanel json={json} reduced={reduced} />
      <TerminalPanel flow={flow} reduced={reduced} />
    </div>
  );
}
