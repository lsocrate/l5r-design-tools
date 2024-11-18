const TOKEN = "";

const cur_cards = await fetch("https://www.emeralddb.org/api/cards").then(
  (res) => res.json(),
);
const core_cards = cur_cards.filter((card) =>
  card.versions.some((version) => version.pack_id === "emerald-core-set"),
);

async function save(id, data) {
  await fetch(`https://beta-emeralddb.herokuapp.com/api/cards/${id}`, {
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json;charset=utf-8",
    },
    method: "POST",
    body: JSON.stringify(data),
  });
}

for (const card of core_cards) {
  const { versions, ...rest } = card;
  await save(card.id, rest);
  console.log("updated", card.id);
}

console.log("done");
