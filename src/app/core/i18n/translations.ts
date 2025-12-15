import { LangCode } from '../models/lang';

export type TranslationKey =
  | 'app.title'
  | 'nav.songs'
  | 'nav.snapshots'
  | 'songs.title'
  | 'songs.key'
  | 'songs.placeholder'
  | 'songs.untitled'
  | 'songDetail.style'
  | 'songDetail.rhythm'
  | 'songDetail.notFound'
  | 'snapshot.title'
  | 'snapshot.subtitle'
  | 'snapshot.clear'
  | 'snapshot.selected'
  | 'lang.label';

export const supportedLangs: LangCode[] = ['en', 'es'];

export const fallbackLang: LangCode = 'en';

export const translations: Partial<Record<LangCode, Record<TranslationKey, string>>> = {
  en: {
    'app.title': 'NoteDraftForge',
    'nav.songs': 'Songs',
    'nav.snapshots': 'Snapshots',
    'songs.title': 'Songs',
    'songs.key': 'Key',
    'songs.placeholder': 'Select a song to view its details.',
    'songs.untitled': 'Untitled',
    'songDetail.style': 'Style',
    'songDetail.rhythm': 'Rhythm',
    'songDetail.notFound': 'Song not found. Pick another one from the list.',
    'snapshot.title': 'Snapshot Builder',
    'snapshot.subtitle': 'Select songs to include in a printable snapshot.',
    'snapshot.clear': 'Clear selection',
    'snapshot.selected': 'Selected',
    'lang.label': 'Language',
  },
  es: {
    'app.title': 'NoteDraftForge',
    'nav.songs': 'Canciones',
    'nav.snapshots': 'Instant\u00e1neas',
    'songs.title': 'Canciones',
    'songs.key': 'Tonalidad',
    'songs.placeholder': 'Selecciona una canci\u00f3n para ver sus detalles.',
    'songs.untitled': 'Sin t\u00edtulo',
    'songDetail.style': 'Estilo',
    'songDetail.rhythm': 'Ritmo',
    'songDetail.notFound': 'Canci\u00f3n no encontrada. Elige otra de la lista.',
    'snapshot.title': 'Constructor de instant\u00e1neas',
    'snapshot.subtitle': 'Selecciona canciones para incluir en una instant\u00e1nea imprimible.',
    'snapshot.clear': 'Limpiar selecci\u00f3n',
    'snapshot.selected': 'Seleccionadas',
    'lang.label': 'Idioma',
  },
};
