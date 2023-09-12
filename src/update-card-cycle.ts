import { Card, fetchCards } from "./client/emdb.js";

const pack_id = "core-set-2";

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
        authorization:
          "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im10TTV4SnlXMEFIMmt0b1FQVWpRVSJ9.eyJpc3MiOiJodHRwczovL2Rldi00bDg0OW1pNy5ldS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjBjYjZjMThiODZiNDUwMDcwYjhhMWNjIiwiYXVkIjpbImh0dHA6Ly9maXZlcmluZ3NkYi5jb20iLCJodHRwczovL2Rldi00bDg0OW1pNy5ldS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjk0NDQyNDcwLCJleHAiOjE2OTQ1Mjg4NzAsImF6cCI6InR1VXRlYzBtZmhFd3E0Vk1Fa1ZPMVNOU2p5N2JoaEpZIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCJ9.2q7a4y4XJ9pd0HyM_PAWFATkngVUCRE5a8WQh4xb3h0mM9ZAZFeIQgbYBK_8x46Uvss1nBELNN0QWMuaAh4HfxcjKhHxdl3Ysw3fp4LNsJdnVJ8x5m4VWBmX1I5rvJHUdqJ4iqoM2l3pxIG7ZQA5glrXnRM7_0Cv4XnE2QLNUugFskjf-bMH1GgMs_QTKhNRQMNvatcCaYkxbgv3BbR8t7X_Fa49k1Mr2RAtXWQkn2PuLUpwyDSS-qPh7DA1LovpR8RgaSoJTWGrNodXp3IknkxQaZeRuTVLiE7HQir8SinnjcxVCBo0UXbfztDvWiU5LvI1CIu1AtGEOZQINYGvvQ",
        "content-type": "application/json;charset=UTF-8",
      },
      method: "POST",
      body: JSON.stringify({ cardsInPacks }),
    })
  )
  .then((res) => console.log(res))
  .catch((res) => console.log(res));
