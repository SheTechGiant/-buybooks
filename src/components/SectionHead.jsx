import Reveal from './Reveal';

export default function SectionHead({ eyebrow, title, children, light = false }) {
  return (
    <Reveal className={`section-head${light ? ' light' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </Reveal>
  );
}
