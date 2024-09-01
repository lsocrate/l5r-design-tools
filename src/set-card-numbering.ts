import { Card, Version, fetchCards, fetchTraits } from "./client/emdb.js";

const [, , pack] = process.argv;
if (!pack) {
  console.error("Pack and packcode params are required");
  process.exit(1);
}

const [allCards] = await Promise.all([fetchCards()]);

main(pack, allCards);

async function main(pack: string, allCards: Map<string, Card>) {
  const packCards = Array.from(allCards.values()).flatMap((c) => {
    return c.versions.flatMap((v) => {
      if (v.pack_id === pack) {
        const oldPosition = parseInt(v.position, 10);
        return {
          sortingKey: sortingKey(c),
          card_id: c.id,
          pack_id: v.pack_id,
          flavor: v.flavor ?? "",
          illustrator: v.illustrator ?? "",
          image_url: v.image_url ?? "",
          oldPosition: isNaN(oldPosition) ? undefined : oldPosition,
          quantity: v.quantity ?? 3,
          rotated: v.rotated ?? false,
        };
      } else {
        return [];
      }
    });
  });
  const usedPositions = new Set(
    packCards.flatMap((c) => (!c.oldPosition ? [] : c.oldPosition)),
  );
  const positionGenerator = positionMaker(usedPositions);

  packCards.sort((a, b) => a.sortingKey.localeCompare(b.sortingKey));

  for (const card of packCards) {
    const data = {
      cardInPack: {
        card_id: card.card_id,
        pack_id: card.pack_id,
        flavor: card.flavor,
        illustrator: card.illustrator,
        image_url: card.image_url,
        quantity: card.quantity,
        rotated: card.rotated,
        position: card.oldPosition ?? positionGenerator.next().value,
      },
    };
    await fetch("https://beta-emeralddb.herokuapp.com/api/cards-in-packs", {
      headers: {
        authorization: `Bearer ${process.env.TOKEN}`,
        "content-type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(data),
      method: "PUT",
    });
  }
}

function* positionMaker(usedPositions: Set<number>) {
  for (let position = 1; true; position++) {
    if (!usedPositions.has(position)) {
      yield position;
    }
  }
}

function sortingKey(c: Card) {
  return `${sortFaction(c)}-${sortSide(c)}-${sortType(c)}-${c.name}`;
}

function sortFaction(c: Card) {
  return c.faction === "neutral" ? "zNeutral" : c.faction;
}

function sortSide(c: Card) {
  switch (c.side) {
    case "province":
      return "a";
    case "role":
      return "b";
    case "dynasty":
      return "c";
    case "conflict":
      return "d";
    case "treaty":
      return "e";
  }
}

function sortType(c: Card) {
  switch (c.type) {
    case "stronghold":
      return "a";
    case "role":
      return "b";
    case "province":
      return "c";
    case "holding":
      return "d";
    case "character":
      return "e";
    case "event":
      return "f";
    case "attachment":
      return "g";
    case "treaty":
      return "h";
    case "warlord":
      return "i";
  }
}
