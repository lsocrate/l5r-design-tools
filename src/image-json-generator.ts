import { Card, Version, fetchCards, fetchTraits } from "./client/emdb.js";

const [, , pack, packCode] = process.argv;
if (!pack || !packCode) {
  console.error("Pack and packcode params are required");
  process.exit(1);
}

const [traitMap, allCards] = await Promise.all([fetchTraits(), fetchCards()]);

main(pack, allCards);

function main(pack: string, allCards: Card[]) {
  const packCards = allCards.filter((c) =>
    c.versions.some((v) => v.pack_id === pack)
  );
  if (packCards.length < 1) {
    console.error("the chosen pack has no cards");
    process.exit(1);
  }

  const artJson = packCards.flatMap(toImageJson);
  const sortedJson = artJson.sort(
    (a, b) => parseInt(a.card_id, 10) - parseInt(b.card_id, 10)
  );

  console.log(JSON.stringify(sortedJson));
}

function toImageJson(
  c: Card
): Array<
  | ReturnType<typeof toProvince>
  | ReturnType<typeof toHolding>
  | ReturnType<typeof toAttachment>
  | ReturnType<typeof toCharacter>
  | ReturnType<typeof toEvent>
  | ReturnType<typeof toStronghold>
  | ReturnType<typeof toRole>
> {
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
    case "role":
      return [toRole(c)];
    default:
      return [];
  }
}

function toStronghold(c: Card) {
  return {
    artist: artist(c),
    artwork: artwork(c),
    card_frame: `frames/${c.faction}_stronghold.png`,
    card_id: cardId(c),
    stronghold_fate: c.fate ?? 7,
    stronghold_flavour: flavor(c),
    stronghold_honour: c.honor ?? 99,
    stronghold_influence: c.influence_pool ?? 10,
    stronghold_modifier_value: c.strength_bonus,
    stronghold_text: text(c),
    stronghold_title: title(c),
    stronghold_traits: traits(c),
  };
}

function toRole(c: Card) {
  return {
    artist: artist(c),
    artwork: artwork(c),
    card_frame: `frames/${c.faction}_role.png`,
    card_id: cardId(c),
    role_flavour: flavor(c),
    role_text: text(c),
    role_title: title(c),
    role_traits: traits(c),
  };
}

function toProvince(c: Card) {
  return {
    artist: artist(c),
    artwork: artwork(c),
    card_frame: `frames/${c.faction}_province.png`,
    card_id: cardId(c),
    ...provinceElements(c),
    province_flavour: flavor(c),
    province_strength: c.strength,
    province_text: text(c),
    province_title: title(c),
    province_traits: traits(c),
  };
}

function toCharacter(c: Card) {
  return {
    artist: artist(c),
    artwork: artwork(c),
    card_frame: `frames/${c.faction}_character.png`,
    card_id: cardId(c),
    character_flavour: flavor(c),
    character_glory: c.glory ?? 0,
    character_military: c.military == undefined ? "-" : c.military,
    character_political: c.political == undefined ? "-" : c.political,
    character_text: text(c),
    character_title: title(c),
    character_traits: traits(c),
    deck_type: deckType(c),
    fate_cost: fateCost(c),
    influence: influence(c),
  };
}

function toEvent(c: Card) {
  return {
    artist: artist(c),
    artwork: artwork(c),
    card_frame: `frames/${c.faction}_event.png`,
    card_id: cardId(c),
    deck_type: deckType(c),
    event_flavour: flavor(c),
    event_text: text(c),
    event_title: title(c),
    event_traits: traits(c),
    fate_cost: fateCost(c),
    influence: influence(c),
  };
}

function toAttachment(c: Card) {
  return {
    artist: artist(c),
    artwork: artwork(c),
    attachment_flavour: flavor(c),
    ...skillModifier(c),
    attachment_text: text(c),
    attachment_title: title(c),
    attachment_traits: traits(c),
    card_frame: `frames/${c.faction}_attachment.png`,
    card_id: cardId(c),
    deck_type: deckType(c),
    fate_cost: fateCost(c),
    influence: influence(c),
  };
}

function toHolding(c: Card) {
  return {
    artist: artist(c),
    artwork: artwork(c),
    card_frame: `frames/${c.faction}_holding.png`,
    card_id: cardId(c),
    deck_type: deckType(c),
    holding_flavour: flavor(c),
    ...holdingModifier(c),
    holding_text: text(c),
    holding_title: title(c),
    holding_traits: traits(c),
  };
}

function title(c: Card): string {
  const name = c.name_extra ? `${c.name} ${c.name_extra}` : c.name;
  const unique = c.is_unique ? "[unique] " : "";
  return `${unique}${name}`;
}

function traits(c: Card): string {
  if (!c.traits || c.traits.length < 1) {
    return "";
  }

  return (
    c.traits.flatMap((traitId) => traitMap.get(traitId) ?? []).join(". ") + "."
  );
}

function text(c: Card): string {
  return !c.text
    ? ""
    : c.text
        .replaceAll("<br/>", "\n") // line breaks
        .replaceAll(" - ", " – ") // hyphen to en-dash on cost - effect separation
        .replace(
          /[+-][X\d]/g,
          (match) => (match[0] === "+" ? `+${match[1]}` : `−${match[1]}`) // proper math symbols
        );
}

function influence(c: Card) {
  return c.influence_cost ? `influence/${c.influence_cost}.png` : undefined;
}

function version(c: Card): Version {
  const version = c.versions.find((v) => v.pack_id === pack);
  if (!version) {
    throw Error(`BAD VERSION FOR ${c}`);
  }
  return version;
}

function cardId(c: Card): string {
  return version(c).position;
}

function flavor(c: Card): string {
  return version(c).flavor ?? "";
}

function artwork(c: Card): string {
  return `artworks/${packCode}${cardId(c).padStart(3, "0")}.jpg`;
}

function deckType(c: Card) {
  switch (c.side) {
    case "conflict":
      return "C";
    case "dynasty":
      return "D";
    default:
      return "";
  }
}

function provinceElements(c: Card) {
  const els = c.elements.sort();
  switch (els.length) {
    case 5:
      return { province_element: "elements/tomoe.png" };
    case 1:
      return { province_element: `elements/${els[0]}.png` };
    default:
      return { province_element_pair: `elements/${els[0]}_${els[1]}.png` };
  }
}

function fateCost(c: Card) {
  return typeof c.cost === "string" && c.cost.length > 0 ? c.cost : "-";
}

function artist(c: Card): string {
  return version(c).illustrator ?? "";
}

function holdingModifier(c: Card) {
  if (c.strength_bonus) {
    return {
      holding_modifier: c.strength_bonus[0],
      holding_modifier_value: parseInt(c.strength_bonus.slice(1), 10),
    };
  }

  return { holding_modifier: "+", holding_modifier_value: 0 };
}

function skillModifier(c: Card) {
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
}
