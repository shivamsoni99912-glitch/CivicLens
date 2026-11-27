import MicroSlats from './MicroSlats/MicroSlats';

/**
 * Hero background — the official React Bits "Micro Slats" component.
 * Source: reactbits.dev/backgrounds/micro-slats (DavidHDev/react-bits, ogl).
 *
 * Navy base, cream slats and coral glints. It sits behind the hero content with
 * pointer-events disabled; the component itself pauses under
 * `prefers-reduced-motion: reduce` and needs WebGL2, so the hero keeps a solid
 * navy background underneath as a fallback.
 */
export default function HeroSlats() {
  return (
    <div className="hero-slats" aria-hidden="true">
      <MicroSlats
        preset="swell"
        color="#F4EDE0"
        glintColor="#FF6B5B"
        backgroundColor="#14123D"
        slatWidth={14}
        slatHeight={24}
        gap={4}
        roundness={0.85}
        scale={0.85}
        speed={0.5}
        chop={0.6}
        stretch={0.22}
        glint={1.35}
        contrast={0.48}
        fog={0.34}
        perspective={0.55}
        interactive={false}
        intro
        introDuration={1.8}
      />
    </div>
  );
}
