export interface Wish {
  id: string;
  name: string;
  message: string;
  image?: string;
  cardColor?: string;
  illustration?: string;
  timestamp: number;
  reactions: number;
  reactionBreakdown?: Partial<Record<"like" | "love" | "hug" | "star", number>>;
}

export interface WishesData {
  wishes: Wish[];
  config: {
    farewellDate: string;
    teamMemberName: string;
  };
}
