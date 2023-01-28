import { Card, fetchCards } from "./client/emdb.js";
import { parseCli } from "./parser.js";

const cli = parseCli();
if (cli.error !== undefined) {
  console.error(cli.error);
  process.exit(1);
}

const allCards = await fetchCards();
const packCards = allCards.filter((c) =>
  c.versions.some((v) => v.pack_id === cli.args.pack)
);
if (packCards.length < 1) {
  console.error("the chosen pack has no cards");
  process.exit(1);
}

const factionOrd = {
  crab: 0,
  crane: 1,
  dragon: 2,
  lion: 3,
  phoenix: 4,
  scorpion: 5,
  unicorn: 6,
  neutral: 7,
} as const;
const sorted = packCards.sort(
  (a, b) => factionOrd[a.faction] - factionOrd[b.faction]
);
const grouped = sorted.reduce(
  (g, c) => {
    switch (c.type) {
      case "stronghold":
        g.strongholds.push(c);
        return g;
      case "province":
        g.provinces.push(c);
        return g;
      case "role":
        g.roles.push(c);
        return g;
      case "holding":
        g.holdings.push(c);
        return g;
      case "attachment":
        g.attachments.push(c);
        return g;
      case "character":
        switch (c.side) {
          case "conflict":
            g.conflictCharacters.push(c);
            return g;
          case "dynasty":
            g.dynastyCharacters.push(c);
            return g;
          default:
            return g;
        }
      case "event":
        switch (c.side) {
          case "conflict":
            g.conflictEvents.push(c);
            return g;
          case "dynasty":
            g.dynastyEvents.push(c);
            return g;
          default:
            return g;
        }
      default:
        return g;
    }
  },
  {
    strongholds: [] as Card[],
    provinces: [] as Card[],
    dynastyCharacters: [] as Card[],
    conflictCharacters: [] as Card[],
    holdings: [] as Card[],
    dynastyEvents: [] as Card[],
    conflictEvents: [] as Card[],
    attachments: [] as Card[],
    roles: [] as Card[],
  }
);

const createCardNumberGen = (packCode: string) => {
  let n = 1;
  return () => `${packCode}${(n++).toString().padStart(2, "0")}`;
};

const cardNumberGen = createCardNumberGen("ANS");

const title = (c: Card): string => {
  const name = c.name_extra ? `${c.name} ${c.name_extra}` : c.name;
  const unique = c.is_unique ? "[unique] " : "";
  return `${unique}${name}`;
};

const traits = (c: Card): string =>
  !c.traits || c.traits.length < 1
    ? ""
    : c.traits
        .map(
          (t) =>
            t
              .split("-")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ") // non-breaking space
        )
        .join(". ") + ".";

const text = (c: Card): string =>
  c.text.length < 1 ? "" : c.text.replaceAll("<br/>", "\n");

const influence = (c: Card) =>
  c.influence_cost ? `influence/${c.influence_cost}.png` : undefined;

const cardId = (c: Card) => `AnS${c.versions[0]?.position}`;

const artwork = (c: Card) => `artworks/AnS${c.versions[0]?.position}.jpg`;

const deckType = (c: Card) => {
  switch (c.side) {
    case "conflict":
      return "C";
    case "dynasty":
      return "D";
    default:
      return "";
  }
};

const provinceElements = (c: Card) => {
  const els = c.elements.sort();
  return els.length === 5
    ? { province_element: "elements/tomoe.png" }
    : els.length === 1
    ? { province_element: `elements/${els[0]}.png` }
    : { province_element_pair: `elements/${els[0]}_${els[1]}.png` };
};

const fateCost = (c: Card) => c.cost ?? "-";

const artist = (c: Card): string => c.versions[0]?.illustrator ?? "";

const shJSON = (c: Card) => {
  return [];
};

const provinceJSON = (c: Card) => ({
  artist: artist(c),
  artwork: artwork(c),
  card_frame: `frames/${c.faction}_province.png`,
  card_id: cardId(c),
  deck_type: deckType(c),
  ...provinceElements(c),
  province_flavour: "",
  province_strength: c.strength,
  province_text: text(c),
  province_title: title(c),
  province_traits: traits(c),
});

const characterJSON = (c: Card) => ({
  artist: artist(c),
  artwork: artwork(c),
  card_frame: `frames/${c.faction}_character.png`,
  card_id: cardId(c),
  character_flavour: "",
  character_glory: c.glory ?? 0,
  character_military: c.military == undefined ? "-" : c.military,
  character_political: c.political == undefined ? "-" : c.political,
  character_text: text(c),
  character_title: title(c),
  character_traits: traits(c),
  deck_type: deckType(c),
  fate_cost: fateCost(c),
  influence: influence(c),
});

const eventJSON = (c: Card) => ({
  artist: artist(c),
  artwork: artwork(c),
  card_frame: `frames/${c.faction}_event.png`,
  card_id: cardId(c),
  deck_type: deckType(c),
  event_flavour: "",
  event_text: text(c),
  event_title: title(c),
  event_traits: traits(c),
  fate_cost: fateCost(c),
  influence: influence(c),
});

const holdingModifier = (c: Card) => {
  const mods = {
    holding_modifier: "+",
    holding_modifier_value: 0,
  };
  if (c.strength_bonus) {
    mods.holding_modifier = c.strength_bonus[0];
    mods.holding_modifier_value = parseInt(c.strength_bonus.slice(1), 10);
  }

  return mods;
};

const skillModifier = (c: Card) => {
  const mods = {
    attachment_military_modifier: "+",
    attachment_military_modifier_value: 0,
    attachment_political_modifier: "+",
    attachment_political_modifier_value: 0,
  };
  if (c.military_bonus) {
    mods.attachment_military_modifier = c.military_bonus[0];
    mods.attachment_military_modifier_value = parseInt(
      c.military_bonus.slice(1),
      10
    );
  }

  if (c.political_bonus) {
    mods.attachment_political_modifier = c.political_bonus[0];
    mods.attachment_political_modifier_value = parseInt(
      c.political_bonus.slice(1),
      10
    );
  }
  return mods;
};

const attachmentJSON = (c: Card) => ({
  artist: artist(c),
  artwork: artwork(c),
  attachment_flavour: "",
  ...skillModifier(c),
  attachment_text: text(c),
  attachment_title: title(c),
  attachment_traits: traits(c),
  card_frame: `frames/${c.faction}_attachment.png`,
  card_id: cardId(c),
  deck_type: deckType(c),
  fate_cost: fateCost(c),
  influence: influence(c),
});

const holdingJSON = (c: Card) => ({
  artist: artist(c),
  artwork: artwork(c),
  card_frame: `frames/${c.faction}_holding.png`,
  card_id: cardId(c),
  deck_type: deckType(c),
  holding_flavour: "",
  ...holdingModifier(c),
  holding_text: text(c),
  holding_title: title(c),
  holding_traits: traits(c),
});

const artJson = ([] as unknown[]).concat(
  grouped.strongholds.flatMap(shJSON),
  grouped.provinces.flatMap(provinceJSON),
  grouped.holdings.flatMap(holdingJSON),
  grouped.dynastyCharacters.flatMap(characterJSON),
  grouped.dynastyEvents.flatMap(eventJSON),
  grouped.conflictCharacters.flatMap(characterJSON),
  grouped.conflictEvents.flatMap(eventJSON),
  grouped.attachments.flatMap(attachmentJSON)
);

console.log(JSON.stringify(artJson));
