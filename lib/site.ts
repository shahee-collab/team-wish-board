/** Defaults when env vars are unset — override via NEXT_PUBLIC_* in .env.local / Vercel. */
export const sitePersonName =
  process.env.NEXT_PUBLIC_PERSON_NAME ??
  process.env.NEXT_PUBLIC_TEAM_MEMBER_NAME ??
  "Team Member";

export const siteTeamName =
  process.env.NEXT_PUBLIC_TEAM_NAME ?? "my-team";

export const siteOccasionDateDefault = "2026-12-31T23:59:59Z";

/** Resolved occasion date — env var or fallback. */
export const siteOccasionDate =
  (process.env.NEXT_PUBLIC_OCCASION_DATE ??
   process.env.NEXT_PUBLIC_FAREWELL_DATE ??
   siteOccasionDateDefault).trim();

/** Board ID — isolates wishes when multiple boards share one database. */
export const siteBoardId =
  process.env.NEXT_PUBLIC_BOARD_ID ?? "default";
