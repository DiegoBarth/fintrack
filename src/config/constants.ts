export const API_URL = import.meta.env.VITE_API_URL;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/** Maximum session time (7 days in ms). */
export const AUTH_TIMEOUT_MS = 1000 * 60 * 60 * 24 * 7;

/** Interval to renew login_time in localStorage (5 min in ms). */
export const AUTH_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/** Default React Query staleTime (5 min in ms). */
export const QUERY_STALE_TIME_MS = 1000 * 60 * 5;

/** App Base URL (e.g., /financial-control/). Used for assets. */
export const BASE_PATH = import.meta.env.BASE_URL;

/** API request timeout (Apps Script), in ms. */
export const API_TIMEOUT_MS = 30 * 1000;

/** Width (in pixels) of the sensitive area at the screen edges. */
export const EDGE_ZONE = 80;

/** Order of routes used in horizontal swipe navigation. */
export const SWIPE_ROUTES = [
   '/',
   '/incomes',
   '/expenses',
   '/commitments',
   '/dashboard'
];