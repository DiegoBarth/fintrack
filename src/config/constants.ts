export const API_URL = import.meta.env.VITE_API_URL;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/** Minimum time between POST requests to prevent accidental double submissions (in ms). */
export const POST_RATE_LIMIT_MS = 1000;

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Maximum session duration (7 days in ms). */
export const AUTH_TIMEOUT_MS = MS_PER_DAY * 7;

/** Interval to refresh login_time in localStorage (5 min in ms). */
export const AUTH_REFRESH_INTERVAL_MS = 5 * MS_PER_MINUTE;

/** Default staleTime for React Query (5 min in ms). */
export const QUERY_STALE_TIME_MS = 5 * MS_PER_MINUTE;

/** App base URL (e.g., /financial-control/). Used for assets. */
export const BASE_PATH = import.meta.env.BASE_URL;

/** API request timeout (Apps Script), in ms. */
export const API_TIMEOUT_MS = 30 * MS_PER_SECOND;

/** Width (in pixels) of the sensitive edge zone on the screen. */
export const EDGE_ZONE = 80;

/** Minimum swipe distance to trigger navigation. */
export const SWIPE_MIN_DISTANCE_PX = 50;

/** Delta for swipeable to detect movement. */
export const SWIPE_DELTA_PX = 10;

/** Days used for the weekly commitment alerts. */
export const WEEKLY_ALERT_DAYS = 7;

/** Default toast duration (in ms). */
export const TOAST_DEFAULT_DURATION_MS = 3000;

/** Length of the generated toast ID. */
export const TOAST_ID_LENGTH = 9;

/** Order of routes used for horizontal swipe navigation. */
export const SWIPE_ROUTES = [
   '/',
   '/incomes',
   '/expenses',
   '/commitments',
   '/dashboard'
];

/** Categories used in expense/commitment registration. */
export const CATEGORIES = [
   'Alimentação', 'Banco', 'Beleza', 'Casa', 'Educação',
   'Empréstimos', 'Investimento', 'Lazer', 'Pets', 'Presentes',
   'Roupas', 'Saúde', 'Serviços', 'Streaming', 'Telefonia',
   'Transporte', 'Viagem'
];

/** Commitment types used in registration. */
export const COMMITMENT_TYPES = ['Fixo', 'Variável', 'Cartão'];

/** Cards used when registering commitments of type "Card". */
export const CARDS = ['Bradesco', 'Itaú', 'Mercado Pago'];