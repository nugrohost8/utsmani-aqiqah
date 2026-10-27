import { HeroSlider, type Slide } from "./HeroSlider";

function Lantern({ right, line, scale = 1 }: { right: string; line: number; scale?: number }) {
  return (
    <svg className="lantern" style={{ right }} width={60 * scale} height={(line + 100) * scale} viewBox={`0 0 60 ${line + 100}`} aria-hidden="true">
      <line x1="30" y1="0" x2="30" y2={line} stroke="#E8C872" strokeWidth="1.2" />
      <path d={`M18 ${line} h24 l6 14 h-36z`} fill="#C9A24B" />
      <path d={`M12 ${line + 14} h36 q4 30 -6 52 h-24 q-10 -22 -6 -52z`} fill="rgba(245,223,160,.85)" stroke="#C9A24B" strokeWidth="2" />
      <path d={`M18 ${line + 66} h24 l-6 10 h-12z`} fill="#C9A24B" />
    </svg>
  );
}

export function Skyline() {
  return (
    <svg className="skyline" viewBox="0 0 1440 260" preserveAspectRatio="none" height="230" aria-hidden="true">
      <path fill="#141A4A" opacity=".7" d="M0 200 C200 160 400 190 600 170 C800 150 1000 185 1200 165 C1320 155 1400 170 1440 160 V260 H0Z" />
      <g fill="#0A0F2E">
        <rect x="0" y="215" width="1440" height="45" />
        <path d="M560 215 V160 h320 v55z" />
        <path d="M600 160 C600 90 680 60 720 30 C760 60 840 90 840 160Z" />
        <rect x="717" y="6" width="6" height="26" />
        <path d="M470 215 V180 h90 v35z" />
        <path d="M480 180 C480 145 515 130 515 120 C515 130 550 145 550 180Z" />
        <path d="M880 215 V180 h90 v35z" />
        <path d="M890 180 C890 145 925 130 925 120 C925 130 960 145 960 180Z" />
        <rect x="420" y="70" width="24" height="145" />
        <path d="M416 70 h32 l-16 -40z" />
        <rect x="412" y="110" width="40" height="8" />
        <rect x="996" y="70" width="24" height="145" />
        <path d="M992 70 h32 l-16 -40z" />
        <rect x="988" y="110" width="40" height="8" />
        <path d="M80 215 v-40 l40 -30 l40 30 v40z" />
        <path d="M180 215 v-60 h70 v60z" />
        <path d="M1200 215 v-50 l35 -25 l35 25 v50z" />
        <path d="M1290 215 v-35 h80 v35z" />
      </g>
      <path d="M720 0 a8 8 0 1 0 6 12 a6 6 0 1 1 -6 -12z" fill="#E8C872" />
      <g fill="#F5DFA0" opacity=".85">
        <path d="M700 215 v-30 a20 20 0 0 1 40 0 v30z" opacity=".55" />
        <rect x="610" y="175" width="14" height="22" rx="7" />
        <rect x="816" y="175" width="14" height="22" rx="7" />
        <rect x="198" y="175" width="10" height="14" />
        <rect x="222" y="175" width="10" height="14" />
        <rect x="113" y="185" width="12" height="14" />
        <rect x="1229" y="180" width="12" height="14" />
        <rect x="1310" y="192" width="10" height="10" />
        <rect x="1340" y="192" width="10" height="10" />
        <rect x="428" y="140" width="8" height="12" rx="4" />
        <rect x="1004" y="140" width="8" height="12" rx="4" />
      </g>
    </svg>
  );
}

export function Hero({ slides, tagline }: { slides: Slide[]; tagline: string }) {
  const items: Slide[] = slides.length
    ? slides.map((s) => ({ ...s, eyebrow: s.eyebrow || tagline }))
    : [
        {
          id: 0,
          eyebrow: tagline,
          title: "Bintang Kecil Telah Lahir, Rayakan dengan *Aqiqah Penuh Berkah*",
          subtitle: null,
          imageUrl: null,
          primaryLabel: "Lihat Paket Aqiqah",
          primaryUrl: "/paket",
          secondaryLabel: "☾ Isi Formulir Pemesanan",
          secondaryUrl: "/pesan",
        },
      ];

  return (
    <HeroSlider
      slides={items}
      decor={
        <>
          <div className="layer starfield" />
          <div className="milky" />
          <div className="moon-glow" />
          <div className="moon" />
          <span className="bigstar" style={{ right: "34%", top: 150, fontSize: 26 }}>✦</span>
          <span className="bigstar" style={{ right: "8%", top: 420, fontSize: 18 }}>✦</span>
          <span className="bigstar" style={{ left: "50%", top: 520, fontSize: 14 }}>✦</span>
          <span className="bigstar" style={{ left: "6%", top: 150, fontSize: 12 }}>✧</span>
          <Lantern right="39%" line={200} />
          <Lantern right="3%" line={140} scale={0.85} />
          <Skyline />
        </>
      }
    />
  );
}

export function PageHead({ tag, title, description }: { tag: string; title: string; description?: string }) {
  return (
    <header className="page-head">
      <div className="layer starfield" />
      <div className="container">
        <span className="tag">{tag}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </header>
  );
}
