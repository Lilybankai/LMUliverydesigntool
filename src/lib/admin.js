// Admin allowlist. Keep this in sync with the `public.is_admin()` SQL function
// in admin-analytics-schema.sql — both gate access to the admin dashboard and
// the underlying data (client-side routing here, row-level security there).
export const ADMIN_EMAILS = [
  'marketing@thelilybankagency.co.uk',
];

export const isAdminEmail = (email) =>
  !!email && ADMIN_EMAILS.includes(String(email).toLowerCase().trim());
