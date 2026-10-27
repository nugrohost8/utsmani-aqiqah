/* eslint-disable @next/next/no-img-element -- logo upload disajikan dari /uploads */
import Image from "next/image";
import defaultLogo from "../../public/brand/logo-white.png";

/** Logo dari Pengaturan; jatuh ke logo bawaan bila belum diunggah. */
export function Logo({ src, alt, height, priority }: { src?: string; alt: string; height: number; priority?: boolean }) {
  const style = { height, width: "auto" };
  if (src) return <img src={src} alt={alt} style={style} fetchPriority={priority ? "high" : undefined} />;
  const width = Math.round((height * defaultLogo.width) / defaultLogo.height);
  return <Image src={defaultLogo} alt={alt} width={width} height={height} priority={priority} />;
}
