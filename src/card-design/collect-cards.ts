import { fetchPacks } from "../client/emdb.js";
import { Card, fetchCards, fetchTraits } from "../client/emdb.js";
import * as csv from "csv";

interface Ord {
  compare(): number;
}

class FactionOrd implements Ord {
  constructor(private a: Card, private b: Card) {}
  public compare() {
    const af = this.a.faction === "neutral" ? "_neutral" : this.a.faction;
    const bf = this.b.faction === "neutral" ? "_neutral" : this.a.faction;
    return af.localeCompare(bf);
  }
}

class TypeOrd implements Ord {
  constructor(private a: Card, private b: Card) {}

  public compare() {
    return this.n(this.a) - this.n(this.b);
  }

  private n(c: Card) {
    switch (c.type) {
      case "role":
        return 1;
      case "stronghold":
        return 2;
      case "province":
        return 3;
      case "holding":
        return 4;
      case "character":
        return 5;
      case "event":
        return 6;
      case "attachment":
        return 7;
      case "warlord":
        return 8;
      case "treaty":
        return 9;
    }
  }
}

class NameOrd implements Ord {
  constructor(private a: Card, private b: Card) {}

  public compare() {
    return this.a.name.localeCompare(this.b.name);
  }
}

const [traitMap, allCards, allPacks] = await Promise.all([
  fetchTraits(),
  fetchCards(),
  fetchPacks(),
]);

main(allCards);
function main(allCards: Card[]) {
  const targetCycles = new Set(["core", "imperial"]);
  const targetPacks = new Map(
    allPacks.flatMap((p) =>
      targetCycles.has(p.cycle_id) ? [[p.id, p.cycle_id]] : []
    )
  );
  const packCards = allCards.filter((c) =>
    c.versions.some((v) => targetPacks.has(v.pack_id))
  );
  if (packCards.length < 1) {
    console.error("the chosen pack has no cards");
    process.exit(1);
  }

  const sortedCards = packCards.sort((a, b) => {
    const n = new TypeOrd(a, b).compare();
    if (n !== 0) return n;
    const f = new FactionOrd(a, b).compare();
    if (f !== 0) return f;
    return new NameOrd(a, b).compare();
  });

  const stringifier = csv.stringify();
  stringifier.pipe(process.stdout);

  sortedCards.forEach((c) => stringifier.write(toCsv(c)));
}

function toCsv(c: Card): string[] {
  switch (c.type) {
    case "role":
      return [faction(c), title(c), legality(c)];
    case "stronghold":
      return [
        faction(c),
        title(c),
        legality(c),
        honor(c),
        fate(c),
        influence(c),
        strengthBonus(c),
        traits(c),
        text(c),
      ];
    case "province":
      return [
        faction(c),
        title(c),
        legality(c),
        roleLock(c),
        elements(c),
        strength(c),
        traits(c),
        text(c),
      ];
    case "holding":
      return [
        faction(c),
        title(c),
        legality(c),
        roleLock(c),
        strengthBonus(c),
        traits(c),
        text(c),
      ];
    case "event":
      return [
        faction(c),
        title(c),
        legality(c),
        roleLock(c),
        fateCost(c),
        traits(c),
        text(c),
      ];
    case "character":
      return [
        faction(c),
        title(c),
        legality(c),
        roleLock(c),
        fateCost(c),
        skill(c.military),
        skill(c.political),
        glory(c),
        traits(c),
        text(c),
      ];
    case "attachment":
      return [
        faction(c),
        title(c),
        legality(c),
        roleLock(c),
        fateCost(c),
        skillMod(c.military_bonus),
        skillMod(c.political_bonus),
        traits(c),
        text(c),
      ];
    default:
      return [];
  }
}

function title(c: Card): string {
  const name = c.name_extra ? `${c.name} ${c.name_extra}` : c.name;
  const unique = c.is_unique ? "[unique] " : "";
  return `${unique}${name}`;
}

function fateCost(c: Card): string {
  return typeof c.cost === "string" && c.cost.length > 0 ? c.cost : "-";
}

function skill(s: number | null): string {
  return s?.toString() ?? "-";
}
function skillMod(s: string | null): string {
  return s ?? "+0";
}

function glory(c: Card): string {
  return c.glory?.toString() ?? "";
}

function faction(c: Card): string {
  return c.faction;
}

function fate(c: Card): string {
  return c.fate?.toString() ?? "??";
}
function honor(c: Card): string {
  return c.honor?.toString() ?? "??";
}
function influence(c: Card): string {
  return c.influence_pool?.toString() ?? "??";
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
  if (!c.text) return "";
  return c.text
    .replaceAll("<br/>", "\n") // line breaks
    .replaceAll(" - ", " – ") // hyphen to en-dash on cost - effect separation
    .replace(
      /[+-][X\d]/g,
      (match) => (match[0] === "+" ? `+${match[1]}` : `−${match[1]}`) // proper math symbols
    );
}

function elements(c: Card): string {
  return c.elements.sort().join(" • ");
}

function strength(c: Card): string {
  return c.strength ?? "N/A";
}

function strengthBonus(c: Card): string {
  return c.strength_bonus ?? "N/A";
}

function legality(c: Card): string {
  let legality = "";
  if (c.splash_banned_in?.includes("emerald")) {
    return "no-splash";
  }
  if (c.banned_in.includes("emerald")) {
    return "banned";
  } else if (c.restricted_in.includes("emerald")) {
    return "restricted";
  }
  return legality;
}

function roleLock(c: Card): string {
  return c.role_restrictions.join(" + ");
}
