const EMDB = process.env.EMERALD_DB!;

type Pack = {
  cycle_id: string;
  id: string;
  name: string;
  position: number;
  publisher_id: string;
  released_at: string;
  rotated: boolean;
  size: number;
};

type Version = {
  flavor: null | string;
  card_id: string;
  illustrator: string;
  image_url: string;
  pack_id: string;
  position: string;
  quantity: number;
  rotated: boolean;
};

type Clan =
  | "crab"
  | "crane"
  | "dragon"
  | "lion"
  | "phoenix"
  | "scorpion"
  | "unicorn";

export type Faction = Clan | "neutral";

type CardType =
  | "event"
  | "attachment"
  | "province"
  | "holding"
  | "character"
  | "warlord"
  | "role"
  | "stronghold"
  | "treaty";

type Side = "conflict" | "dynasty" | "province" | "role" | "treaty";
type Element = "air" | "earth" | "fire" | "water" | "void";

export type Card = {
  allowed_clans: Clan[];
  banned_in: [];
  cost: null | string;
  deck_limit: 3;
  elements: Element[];
  fate: null | number;
  faction: Faction;
  glory: null | number;
  honor: null | number;
  id: string;
  influence_cost: null | number;
  influence_pool: null | number;
  is_unique: false;
  military: null | number;
  military_bonus: null | string;
  name: string;
  name_extra: null | string;
  political: null | number;
  political_bonus: null | string;
  restricted_in: [];
  role_restrictions: [];
  side: Side;
  splash_banned_in: [];
  strength: null;
  strength_bonus: null | string;
  text: string;
  traits: null | string[];
  type: CardType;
  versions: Version[];
};

export const fetchPacks = (): Promise<Pack[]> =>
  fetch(`${EMDB}/api/packs`).then((res) => res.json());

export const fetchCards = (): Promise<Card[]> =>
  fetch(`${EMDB}/api/cards`).then((res) => res.json());

export const fetchTraits = (): Promise<Map<string, string>> =>
  fetch(`${EMDB}/api/traits`)
    .then((res) => res.json())
    .then(
      (traits: Array<{ id: string; name: string }>) =>
        new Map(traits.map((t) => [t.id, t.name]))
    );
