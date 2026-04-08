export type OccasionType = "farewell" | "birthday" | "anniversary" | "custom";

const raw = (process.env.NEXT_PUBLIC_OCCASION_TYPE ?? "farewell").trim().toLowerCase();
export const occasionType: OccasionType =
  raw === "birthday" || raw === "anniversary" || raw === "custom" ? raw : "farewell";

export function getBoardTitle(name: string): string {
  const override = process.env.NEXT_PUBLIC_BOARD_TITLE?.trim();
  if (override) return override;

  switch (occasionType) {
    case "farewell":
      return `Here's to you, ${name}`;
    case "birthday":
      return `Happy Birthday, ${name}!`;
    case "anniversary":
      return `Celebrating ${name}!`;
    case "custom":
      return `Wishes for ${name}`;
  }
}

export function getMetaDescription(name: string, team: string): string {
  switch (occasionType) {
    case "farewell":
      return `The ${name} Effect — farewell wishes from the ${team} team.`;
    case "birthday":
      return `Happy Birthday, ${name}! — wishes from the ${team} team.`;
    case "anniversary":
      return `Celebrating ${name}! — wishes from the ${team} team.`;
    case "custom":
      return `Wishes for ${name} — from the ${team} team.`;
  }
}

export function getMessagePlaceholder(name: string): string {
  switch (occasionType) {
    case "farewell":
      return `Share your farewell message for ${name}…`;
    case "birthday":
      return `Share your birthday wish for ${name}…`;
    case "anniversary":
      return `Share your message celebrating ${name}…`;
    case "custom":
      return `Share your message for ${name}…`;
  }
}

export function getModalSubtitle(isEdit: boolean): string {
  if (isEdit) return "Update your color, illustration, or message";

  switch (occasionType) {
    case "farewell":
      return "Pick a color, add an illustration, and write your farewell message";
    case "birthday":
      return "Pick a color, add an illustration, and write your birthday message";
    default:
      return "Pick a color, add an illustration, and write your message";
  }
}

export function getNotFoundMessage(): string {
  switch (occasionType) {
    case "farewell":
      return "The page you\u2019re looking for doesn\u2019t exist. Head back to share your farewell wishes.";
    case "birthday":
      return "The page you\u2019re looking for doesn\u2019t exist. Head back to share your birthday wishes.";
    default:
      return "The page you\u2019re looking for doesn\u2019t exist. Head back to share your wishes.";
  }
}
