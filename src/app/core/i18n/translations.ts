import { LangCode } from '../models/lang';

export type TranslationKey =
  | 'app.title'
  | 'nav.songs'
  | 'nav.snapshots'
  | 'songs.title'
  | 'songs.key'
  | 'songs.placeholder'
  | 'songs.untitled'
  | 'songs.new'
  | 'songs.edit'
  | 'songs.save'
  | 'songs.delete'
  | 'songs.cancel'
  | 'songs.export'
  | 'songs.import'
  | 'songs.importError'
  | 'songs.id'
  | 'songs.titleEn'
  | 'songs.titleEs'
  | 'songs.author'
  | 'songs.style'
  | 'songs.rhythm'
  | 'songs.baseKey'
  | 'songs.singers'
  | 'songs.tags'
  | 'songs.sections'
  | 'songs.sectionsInvalid'
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
    'songs.new': 'New',
    'songs.edit': 'Edit',
    'songs.save': 'Save',
    'songs.delete': 'Delete',
    'songs.cancel': 'Cancel',
    'songs.export': 'Export',
    'songs.import': 'Import',
    'songs.importError': 'Could not import songs. Please provide a valid JSON array.',
    'songs.id': 'ID',
    'songs.titleEn': 'Title (EN)',
    'songs.titleEs': 'Title (ES)',
    'songs.author': 'Author',
    'songs.style': 'Style',
    'songs.rhythm': 'Rhythm',
    'songs.baseKey': 'Key',
    'songs.singers': 'Singers',
    'songs.tags': 'Tags',
    'songs.sections': 'Sections JSON',
    'songs.sectionsInvalid': 'Sections JSON is invalid.',
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
    'songs.new': 'Nueva',
    'songs.edit': 'Editar',
    'songs.save': 'Guardar',
    'songs.delete': 'Eliminar',
    'songs.cancel': 'Cancelar',
    'songs.export': 'Exportar',
    'songs.import': 'Importar',
    'songs.importError': 'No se pudo importar. Usa un JSON con una lista de canciones.',
    'songs.id': 'ID',
    'songs.titleEn': 'T\u00edtulo (EN)',
    'songs.titleEs': 'T\u00edtulo (ES)',
    'songs.author': 'Autor',
    'songs.style': 'Estilo',
    'songs.rhythm': 'Ritmo',
    'songs.baseKey': 'Tonalidad',
    'songs.singers': 'Cantantes',
    'songs.tags': 'Etiquetas',
    'songs.sections': 'Secciones (JSON)',
    'songs.sectionsInvalid': 'El JSON de secciones no es v\u00e1lido.',
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
