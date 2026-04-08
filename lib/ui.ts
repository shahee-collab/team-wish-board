const variant = (process.env.NEXT_PUBLIC_UI_VARIANT ?? "").trim().toLowerCase();

/** Dark mode is active when the variant is "dark" (or legacy "cursor"). */
export const isDarkUI = variant === "dark" || variant === "cursor";
