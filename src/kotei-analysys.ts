import { fetchCards } from "./client/emdb.js";
import { writeFileSync } from "fs";

const allCards = await fetchCards();

const deckIds = [
  "cee5eff5-9b30-4577-af77-883996c9e9be",
  "97703286-1836-47ee-8869-fa878c07b5db",
  "38a21a2e-75f7-4df4-b237-af0c8b8ff4a8",
  "37a5c0e3-b6b3-43ee-bcef-031dcdcb87f0",
  "e64c6716-5a99-4952-82f2-a225c936cf7e",
  "841c12b4-cbef-44be-9a8a-92811313fec6",
  "0cc6fa50-420d-4b2c-af35-950e758763c4",
  "fd62e088-d52b-4282-910a-153ede3f9ed9",

  // END CUT
  "16d75272-09a6-4542-ae70-0033f1f4447f",
  "aace0ae1-01e2-4d71-a4e8-e0cfe3b27f35",
  "590ea700-97e0-48f5-8b90-1f6930b2e2e7",
  "4071a565-e65e-45aa-860a-616eddbc2fae",
  "6b35164b-9ad7-4bb3-8a31-a139a4cbd922",
  "977e1847-32f0-4183-a4a7-579da234f5c8",
  "ff29c4e8-c2d4-4fce-90ae-d0e712864eee",

  // END WINNING LINE
  "a890d08d-0fd9-4e5a-974e-c88a312d9689",
  "6bde56dc-563f-4481-97f3-00b65fde224f",
  "9d613ec7-91c4-4438-b69f-7ddd454e6b64",
  "72e66cea-7302-44a8-874f-0efd119765af",
  "ab7146ad-4678-4de0-a1fb-839b31d4114a",
  "9d126768-0515-420e-ad13-090dbab0c6fb",
  "8e1a8f7f-8e69-4c52-b27e-94c70f14c5e1",
  "d6658174-0c02-4c16-8206-2875314b739d",
  "d3643371-1c18-4307-b289-11ae1d26efee",
  "229c6bfe-2ca9-4d52-8ebc-7b38a804b105",
  "9d392f24-6c01-4ae8-bd0e-3ea833dd0df9",
  "aa960ba8-2506-4320-b799-e668119e9c65",
  "440d741d-767e-4696-8e04-9faf3f4a1a9b",
];

for (const deckId of deckIds) {
  const url = `https://www.emeralddb.org/api/decklists/${deckId}`;
  const deckData = await fetch(url)
    .then((res) => res.json())
    .then((deck) => {
      writeFileSync(`./${deckId}.json`, JSON.stringify(deck));
      return new Map<string, number>(Object.entries(deck.cards));
    });
}
