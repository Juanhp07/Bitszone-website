export const GENRES = [
  { id: 'rock', label: 'Rock' },
  { id: 'pop', label: 'Pop' },
  { id: 'rap', label: 'Rap' },
  { id: 'salsa', label: 'Salsa' },
  { id: 'metal', label: 'Metal' },
  { id: 'balada', label: 'Balada' },
  { id: 'alternativo', label: 'Alternativo' },
] as const;

// shortcut: genres live here because the tracks table has no genre column; move them to the DB when it does.
const ARTIST_GENRES: Record<string, string[]> = {
  '5 Seconds of Summer': ['pop', 'rock'],
  "Adolescent's Orquesta": ['salsa'],
  'Bruno Mars': ['pop'],
  'Incubus': ['rock', 'alternativo'],
  'Justin Bieber': ['pop'],
  'LINKIN PARK': ['rock', 'metal'],
  'Michael Jackson': ['pop'],
  'Phil Collins': ['pop', 'balada', 'rock'],
  'Post Malone': ['rap', 'pop'],
  'Radiohead': ['rock', 'alternativo'],
  'Travis Scott': ['rap'],
  'Whitesnake': ['rock', 'metal'],
};

export const artistGenres = (artist: string): string[] => {
  if (ARTIST_GENRES[artist]) return ARTIST_GENRES[artist];
  const key = Object.keys(ARTIST_GENRES).find((k) => artist.startsWith(k)); // "Post Malone & Swae Lee"
  return key ? ARTIST_GENRES[key] : [];
};

export const genreScore = (genres: string[] | undefined, liked: string[]) =>
  (genres ?? []).filter((g) => liked.includes(g)).length;
