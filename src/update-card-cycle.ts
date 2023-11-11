import { Card, fetchCards } from "./client/emdb.js";

const pack_id = "core-set-2";

const BEARER_TOKEN = "";

function* positionMaker(start: number) {
  let i = start;
  while (true) {
    let str = i.toString();
    i += 1;
    yield str;
  }
}

function cardSort(a: Card, b: Card): number {
  const clan = clanSort(a) - clanSort(b);
  if (clan !== 0) {
    return clan;
  }

  const side = sideSort(a) - sideSort(b);
  if (side !== 0) {
    return side;
  }

  const cardType = cardTypeSort(a) - cardTypeSort(b);
  if (cardType !== 0) {
    return cardType;
  }

  return a.name.localeCompare(b.name);
}

function clanSort(a: Card): number {
  switch (a.faction) {
    case "crab":
      return 1;
    case "crane":
      return 2;
    case "dragon":
      return 3;
    case "lion":
      return 4;
    case "phoenix":
      return 5;
    case "scorpion":
      return 6;
    case "unicorn":
      return 7;
    default:
      return 8;
  }
}

function sideSort(a: Card): number {
  switch (a.side) {
    case "province":
      return 1;
    case "dynasty":
      return 2;
    case "conflict":
      return 3;
    case "role":
      return 4;
    default:
      return 5;
  }
}

function cardTypeSort(a: Card): number {
  switch (a.type) {
    case "stronghold":
      return 1;
    case "province":
      return 2;
    case "holding":
      return 3;
    case "character":
      return 4;
    case "event":
      return 5;
    case "attachment":
      return 6;
    case "role":
      return 7;
    default:
      return 8;
  }
}

fetchCards()
  .then((allCards) => {
    const packCards: Card[] = [];
    for (const c of allCards.values()) {
      if (c.versions.some((v) => v.pack_id === pack_id)) {
        packCards.push(c);
      }
    }
    if (packCards.length < 1) {
      console.error("the chosen pack has no cards");
      process.exit(1);
    }

    return packCards.sort(cardSort);
  })
  .then((cards) => {
    const posGen = positionMaker(1);
    return cards.map((c) => {
      const oldVersion = c.versions.find((v) => v.pack_id === pack_id);
      const position = posGen.next().value!;
      return {
        pack_id,
        position,
        card_id: c.id,
        flavor: oldVersion?.flavor ?? "",
        illustrator: oldVersion?.illustrator ?? "",
        image_url: `https://emerald-legacy.github.io/emerald-db-beta-images/elc-5a9f2a205c9ba76217f4fb8d9726d9549b0bb5e275c9d082273acaa65e5a94c4/elc_${position}.jpg`,
        rotated: oldVersion?.rotated ?? false,
        quantity:
          c.type === "stronghold" || c.type === "role" || c.type === "province"
            ? 1
            : 3,
      };
    });
  })
  .then((cardsInPacks) =>
    fetch("https://beta-emeralddb.herokuapp.com/api/cards-in-packs", {
      headers: {
        authorization: `Bearer ${BEARER_TOKEN}`,
        "content-type": "application/json;charset=UTF-8",
      },
      method: "POST",
      body: JSON.stringify({ cardsInPacks }),
    }),
  )
  .then((res) => console.log(res))
  .catch((res) => console.log(res));
