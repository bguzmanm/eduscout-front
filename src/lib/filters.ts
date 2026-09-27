// Debe coincidir con REGIONS de eduscout-back (src/common/utils/regions.ts):
// son los 16 nombres canónicos cortos con los que el backend normaliza
// jobs.region. El orden va por volumen de ofertas y luego geográfico.
export const REGIONS = [
  'Metropolitana',
  'Valparaíso',
  'Biobío',
  'Araucanía',
  'Ñuble',
  "O'Higgins",
  'Maule',
  'Los Lagos',
  'Antofagasta',
  'Coquimbo',
  'Tarapacá',
  'Arica y Parinacota',
  'Atacama',
  'Los Ríos',
  'Aysén',
  'Magallanes',
];

export const JOB_TYPES = [
  'Jornada Completa',
  'Part Time',
  'Mixta',
  'Teletrabajo',
];

export const CATEGORIES = [
  { value: 'universidad_publica', label: 'Universidades Públicas' },
  { value: 'universidad_privada', label: 'Universidades Privadas' },
  { value: 'instituto_profesional', label: 'Institutos Profesionales' },
  { value: 'centro_formacion_tecnica', label: 'Centros de Formación Técnica' },
];