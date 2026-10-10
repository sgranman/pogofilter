// SVG filters that rough up stamp edges like rubber on card stock. Applied
// only to the ink layer behind a stamp, never to its text.
export default function InkDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        <filter id="ink" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="edge" />
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="3" result="voids" />
          <feColorMatrix in="voids" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.3 1.1" result="mask" />
          <feComposite in="edge" in2="mask" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}
