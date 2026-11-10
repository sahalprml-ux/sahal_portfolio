export function Eyebrow({ num, label, delay }: { num: string; label: string; delay?: number }) {
  return (
    <div className="eyebrow" data-reveal={delay ?? ''}>
      <span className="eyebrow-num">{num}</span>
      <span className="eyebrow-line" aria-hidden="true" />
      {label}
    </div>
  );
}
