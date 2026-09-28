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
  
  export const getRandomFont = () => {
    return handwritingFonts[Math.floor(Math.random() * handwritingFonts.length)];
  };
  