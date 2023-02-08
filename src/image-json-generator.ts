import { Card, fetchCards, fetchTraits } from "./client/emdb.js";

const [, , pack, packCode] = process.argv;
if (!pack || !packCode) {
  console.error("Pack and packcode params are required");
  process.exit(1);
}

const [traitMap, allCards] = await Promise.all([fetchTraits(), fetchCards()]);
const packCards = allCards.filter((c) =>
  c.versions.some((v) => v.pack_id === pack)
);
if (packCards.length < 1) {
  console.error("the chosen pack has no cards");
  process.exit(1);
}

const title = (c: Card): string => {
  const name = c.name_extra ? `${c.name} ${c.name_extra}` : c.name;
  const unique = c.is_unique ? "[unique] " : "";
  return `${unique}${name}`;
};

const traits = (c: Card): string =>
  !c.traits || c.traits.length < 1
    ? ""
    : c.traits
        .flatMap((traitId) => {
          const traitName = traitMap.get(traitId);
          return traitName ? [traitName] : [];
        })
        .join(". ") + ".";

const text = (c: Card): string =>
  c.text.length < 1 ? "" : c.text.replaceAll("<br/>", "\n");

const influence = (c: Card) =>
  c.influence_cost ? `influence/${c.influence_cost}.png` : undefined;

const cardId = (c: Card) => `${packCode}${c.versions[0]?.position}`;

const artwork = (c: Card) =>
  `artworks/${packCode}${c.versions[0]?.position}.jpg`;

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

const toStronghold = (c: Card) => ({
  artist: artist(c),
  artwork: artwork(c),
  card_frame: `frames/${c.faction}_stronghold.png`,
  card_id: cardId(c),
  stronghold_fate: c.fate ?? 7,
  stronghold_flavour: "",
  stronghold_honour: c.honor ?? 99,
  stronghold_influence: c.influence_pool ?? 10,
  stronghold_modifier: c.strength_bonus?.[0] ?? "+",
  stronghold_modifier_value: c.strength_bonus
    ? parseInt(c.strength_bonus.slice(1), 10)
    : 0,
  stronghold_text: text(c),
  stronghold_title: title(c),
  stronghold_traits: traits(c),
});

const toProvince = (c: Card) => ({
  artist: artist(c),
  artwork: artwork(c),
  card_frame: `frames/${c.faction}_province.png`,
  card_id: cardId(c),
  ...provinceElements(c),
  province_flavour: "",
  province_strength: c.strength,
  province_text: text(c),
  province_title: title(c),
  province_traits: traits(c),
});

const toCharacter = (c: Card) => ({
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

const toEvent = (c: Card) => ({
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

const toAttachment = (c: Card) => ({
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

const toHolding = (c: Card) => ({
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

const toImageJson = (c: Card): any[] => {
  switch (c.type) {
    case "province":
      return [toProvince(c)];
    case "holding":
      return [toHolding(c)];
    case "attachment":
      return [toAttachment(c)];
    case "character":
      return [toCharacter(c)];
    case "event":
      return [toEvent(c)];
    case "stronghold":
      return [toStronghold(c)];
    default:
      return [];
  }
};

const artJson = packCards.flatMap(toImageJson);
const sortedJson = artJson.sort((a, b) => a.card_id.localeCompare(b.card_id));

console.log(JSON.stringify(sortedJson));
