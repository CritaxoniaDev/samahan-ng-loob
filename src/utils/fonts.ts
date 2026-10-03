export const handwritingFonts = [
    'Indie Flower',
    'Caveat',
    'Kalam',
    'Shadows Into Light',
    'Patrick Hand',
    'Architects Daughter',
    'Homemade Apple',
    'Gloria Hallelujah',
    'Covered By Your Grace',
    'Rock Salt',
    'Reenie Beanie',
    'Sacramento',
    'Satisfy',
    'Marck Script',
    'Nothing You Could Do'
  ];

// Fonts actually loaded in app/layout.tsx, with a size multiplier so every
// handwriting style reads at roughly the same visual size.
const loadedFonts: Record<string, { variable: string; scale: number }> = {
    'Indie Flower': { variable: '--font-indie-flower', scale: 0.95 },
    'Caveat': { variable: '--font-caveat', scale: 1.15 },
    'Kalam': { variable: '--font-kalam', scale: 0.9 },
    'Shadows Into Light': { variable: '--font-shadows-into-light', scale: 1 },
    'Patrick Hand': { variable: '--font-patrick-hand', scale: 1 },
    'Architects Daughter': { variable: '--font-architects-daughter', scale: 0.85 },
    'Gloria Hallelujah': { variable: '--font-gloria-hallelujah', scale: 0.82 },
    'Rock Salt': { variable: '--font-rock-salt', scale: 0.68 },
    'Sacramento': { variable: '--font-sacramento', scale: 1.3 },
    'Satisfy': { variable: '--font-satisfy', scale: 0.95 },
    'Marck Script': { variable: '--font-marck-script', scale: 1.05 },
  };

export const getRandomFont = () => {
    const names = Object.keys(loadedFonts);
    return names[Math.floor(Math.random() * names.length)];
  };

// CSS font-family + size multiplier for a stored font name (falls back to Caveat).
export const noteFont = (name?: string) => {
    const font = name ? loadedFonts[name] : undefined;
    return {
      family: `var(${font?.variable ?? '--font-caveat'}), var(--font-caveat), cursive`,
      scale: font?.scale ?? 1.15,
    };
  };
