// Drivers can buy / sell shares from their wallet too. The page itself is
// user-agnostic — it auto-detects the user's mode and renders with the
// correct dashboard chrome — so we just re-export the rider page rather
// than duplicating ~600 lines.
export { default } from '@/app/rider/wallet/shares/page';
