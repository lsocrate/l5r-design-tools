import EloRank from "elo-rank";
import { Card, fetchCards } from "./client/emdb";

const cardsList = await fetchCards();
const cardElo = new Map(
  cardsList.map((c) => [c.id, { card: c, rating: 1200 }])
);

const elo = new EloRank();

type Deck = Array<{ name: string; count: number }>;
const toDeck = async (url: string): Promise<undefined | Deck> => {
  const [deckId] = url
    .split("/")
    .filter((p) => p.length > 0)
    .slice(-1);

  const res = await fetch(`https://www.emeralddb.org/api/decklists/${deckId}`);
  if (res.status !== 200) {
    return;
  }

  const data = await res.json();
  const cards = data.cards as Record<string, number>;
  return Object.entries(cards).map(([name, count]) => ({
    name,
    count,
  }));
};

const league202212 = {
  decks: new Map(
    await Promise.all(
      [
        [
          "KarolinaV#7508",
          "https://www.emeralddb.org/decks/0c59fc87-5a66-4d10-8c98-eb428dcb52f0/",
        ],
        [
          "AkodoT1#9065",
          "https://www.emeralddb.org/decks/5b035c39-c043-47fb-a11b-3fd137df221b/",
        ],
        [
          "Rurouni Musashi#5263",
          "https://www.emeralddb.org/decks/dc197c1e-eb7c-425b-85e9-158783ddd443/",
        ],
        [
          "MegurineLuka#5948",
          "https://www.emeralddb.org/decks/7f97830b-e0c2-4b41-9d36-b122eac8ac56",
        ],
        [
          "Naurel#7728",
          "https://www.emeralddb.org/decks/97a23831-d7ec-4ac0-8b51-84e5cec3646e/",
        ],
        [
          "Kakita-Tsuru#1164",
          "https://www.emeralddb.org/decks/40e88132-d62b-409b-ad9c-85c19e27038b",
        ],
        [
          "Kakita Harrier#3256",
          "https://www.emeralddb.org/decks/29204618-10f6-4cba-9735-010989d32f1d",
        ],
        [
          "Tancho#6588",
          "https://www.emeralddb.org/decks/a0ff6e20-81bb-4773-8c13-4a89a3d29f8e/",
        ],
        [
          "Mirumoto Akahito#8494",
          "https://www.emeralddb.org/decks/1fb512e4-fcaa-4425-b50a-c611c38df0f1/",
        ],
        [
          "Voidnoob#3957",
          "https://www.emeralddb.org/decks/e85f8073-d6b2-4018-9b9a-90c911092f4e/",
        ],
      ].map(
        async ([player, url]): Promise<[string, undefined | Deck]> => [
          player,
          await toDeck(url),
        ]
      )
    )
  ),
  matchups: [
    { won: "Rurouni Musashi#5263", lost: "KarolinaV#7508" },
    { won: "Rurouni Musashi#5263", lost: "MegurineLuka#5948" },
    { won: "AkodoT1#9065", lost: "Rurouni Musashi#5263" },
    { won: "AkodoT1#9065", lost: "Naurel#7728" },
    { won: "Tancho#6588", lost: "Mirumoto Akahito#8494" },
    { won: "Tancho#6588", lost: "Voidnoob#3957" },
    { won: "Kakita-Tsuru#1164", lost: "Tancho#6588" },
    { won: "Kakita-Tsuru#1164", lost: "Kakita Harrier#3256" },
  ],
};

function countMatchup(winnerDeck: Deck, loserDeck: Deck) {
  for (const entryWinner of winnerDeck) {
    for (const entryLoser of loserDeck) {
      for (let x = 0; x < entryWinner.count; x++) {
        for (let y = 0; y < entryLoser.count; y++) {
          const winner = cardElo.get(entryWinner.name);
          const loser = cardElo.get(entryLoser.name);
          if (winner && loser && winner.card.side === loser.card.side) {
            winner.rating = elo.updateRating(
              elo.getExpected(winner.rating, loser.rating),
              1,
              winner.rating
            );
            loser.rating = elo.updateRating(
              elo.getExpected(loser.rating, winner.rating),
              0,
              loser.rating
            );
          }
        }
      }
    }
  }
}

league202212.matchups.forEach((m) => {
  const w = league202212.decks.get(m.won);
  const l = league202212.decks.get(m.lost);
  if (w && l) {
    countMatchup(w, l);
  }
});

const sorted = Array.from(cardElo.values()).sort((a, b) => b.rating - a.rating);
const categories = sorted.reduce(
  (acc, entry) => {
    switch (entry.card.type) {
      case "stronghold":
        acc.strongholds.push(entry);
        return acc;
      case "role":
        acc.roles.push(entry);
        return acc;
      case "province":
        acc.provinces.push(entry);
        return acc;
      case "holding":
        acc.holdings.push(entry);
        return acc;
      case "attachment":
        acc.attachments.push(entry);
        return acc;
      case "character":
        acc.characters.push(entry);
        return acc;
      case "event":
        acc.events.push(entry);
        return acc;
      default:
        return acc;
    }
  },
  {
    strongholds: [] as Array<{ card: Card; rating: number }>,
    roles: [] as Array<{ card: Card; rating: number }>,
    provinces: [] as Array<{ card: Card; rating: number }>,
    holdings: [] as Array<{ card: Card; rating: number }>,
    attachments: [] as Array<{ card: Card; rating: number }>,
    characters: [] as Array<{ card: Card; rating: number }>,
    events: [] as Array<{ card: Card; rating: number }>,
  }
);

console.log("=== strongholds ===");
console.log(
  categories.strongholds
    .slice(0, 3)
    .map((e) => `${e.rating.toString().padStart(4, " ")}: ${e.card.name}`)
    .join("\n")
);

console.log("=== roles ===");
console.log(
  categories.roles
    .slice(0, 3)
    .map((e) => `${e.rating.toString().padStart(4, " ")}: ${e.card.name}`)
    .join("\n")
);

console.log("=== provinces ===");
console.log(
  categories.provinces
    .slice(0, 5)
    .map((e) => `${e.rating.toString().padStart(4, " ")}: ${e.card.name}`)
    .join("\n")
);

console.log("=== holdings ===");
console.log(
  categories.holdings
    .slice(0, 10)
    .map((e) => `${e.rating.toString().padStart(4, " ")}: ${e.card.name}`)
    .join("\n")
);

console.log("=== characters ===");
console.log(
  categories.characters
    .slice(0, 10)
    .map((e) => `${e.rating.toString().padStart(4, " ")}: ${e.card.name}`)
    .join("\n")
);

console.log("=== events ===");
console.log(
  categories.events
    .slice(0, 10)
    .map((e) => `${e.rating.toString().padStart(4, " ")}: ${e.card.name}`)
    .join("\n")
);

console.log("=== attachments ===");
console.log(
  categories.attachments
    .slice(0, 10)
    .map((e) => `${e.rating.toString().padStart(4, " ")}: ${e.card.name}`)
    .join("\n")
);
