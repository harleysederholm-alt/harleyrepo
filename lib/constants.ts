/**
 * Sovelluksen konstantit
 */

export const APP_NAME = 'PienHankinta-Vahti';
export const APP_DESCRIPTION =
  'Älykäs työkalu pienhankintamahdollisuuksien löytämiseen suomalaisille yrittäjille';

/**
 * Suomen suurimmat kunnat ja kaupungit
 * Lähde: Tilastokeskus 2024
 */
export const KUNNAT = [
  'Helsinki',
  'Espoo',
  'Tampere',
  'Vantaa',
  'Oulu',
  'Turku',
  'Jyväskylä',
  'Lahti',
  'Kuopio',
  'Kouvola',
  'Pori',
  'Joensuu',
  'Lappeenranta',
  'Hämeenlinna',
  'Vaasa',
  'Seinäjoki',
  'Rovaniemi',
  'Mikkeli',
  'Kotka',
  'Salo',
  'Porvoo',
  'Kokkola',
  'Hyvinkää',
  'Lohja',
  'Järvenpää',
  'Rauma',
  'Kirkkonummi',
  'Tuusula',
  'Kajaani',
  'Kerava',
] as const;

/**
 * Toimialat (pienhankintakategoriat)
 */
export const TOIMIALAT = [
  'Rakentaminen ja remontointi',
  'Siivouspalvelut',
  'IT ja ohjelmistokehitys',
  'Konsultointi ja koulutus',
  'Viherrakentaminen ja kiinteistönhoito',
  'Turvallisuuspalvelut',
  'Catering ja ruokapalvelut',
  'Graafinen suunnittelu ja markkinointi',
  'Kääntäminen ja tulkkaus',
  'Logistiikka ja kuljetus',
  'Sähköasennus ja -huolto',
  'LVI-palvelut',
  'Maalaus ja pintakäsittely',
  'Jätehuolto ja kierrätys',
  'Taloushallinto ja kirjanpito',
  'Muut palvelut',
] as const;

/**
 * Groq API -asetukset
 */
export const GROQ_CONFIG = {
  ANALYSIS_MODEL: 'llama3-70b-8192',
  MATCHING_MODEL: 'llama3-8b-8192',
  PROPOSAL_MODEL: 'llama3-70b-8192',
  API_URL: 'https://api.groq.com/openai/v1/chat/completions',
} as const;

/**
 * Reittien nimet (App Router)
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  LOGOUT: '/logout',
} as const;

/**
 * Osuvuusprosenttien kynnysarvot
 */
export const MATCH_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40,
  POOR: 0,
} as const;
