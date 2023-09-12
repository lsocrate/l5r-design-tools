import { Card, fetchCards } from "./client/emdb.js";

const pack_id = "core-set-2";

const BEARER_TOKEN = "CHANGE_ME";

function* positionMaker(start: number) {
  let i = start;
  while (true) {
    let str = i.toString();
    i += 1;
    yield str;
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

    return packCards.sort((a, b) => {
      const faction = a.faction.localeCompare(b.faction);
      if (faction !== 0) {
        return faction;
      }
      const side = a.side.localeCompare(b.side);
      if (side !== 0) {
        return side;
      }
      const cardType = a.type.localeCompare(b.type);
      if (cardType !== 0) {
        return cardType;
      }
      return a.id.localeCompare(b.id);
    });
  })
  .then((cards) => {
    const highestDefinedPosition = cards.reduce((pos, card) => {
      const pStr = card.versions.find((v) => v.pack_id === pack_id)?.position;
      if (pStr == null) {
        return pos;
      }
      const pNum = parseInt(pStr, 10);
      if (isNaN(pNum)) {
        return pos;
      }
      return Math.max(pos, pNum);
    }, 0);
    const posGen = positionMaker(highestDefinedPosition + 1);
    return cards.map((c) => {
      const oldVersion = c.versions.find((v) => v.pack_id === pack_id);
      const position = oldVersion?.position || posGen.next().value!;
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
    })
  )
  .then((res) => console.log(res))
  .catch((res) => console.log(res));
