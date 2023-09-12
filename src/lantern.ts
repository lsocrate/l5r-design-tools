import { Card, fetchCards } from "./client/emdb.js";
import a from "../kotei-decks/cee5eff5-9b30-4577-af77-883996c9e9be.json"
import b from "../kotei-decks/97703286-1836-47ee-8869-fa878c07b5db.json"
import c from "../kotei-decks/38a21a2e-75f7-4df4-b237-af0c8b8ff4a8.json"
import d from "../kotei-decks/37a5c0e3-b6b3-43ee-bcef-031dcdcb87f0.json"
import e from "../kotei-decks/e64c6716-5a99-4952-82f2-a225c936cf7e.json"
import f from "../kotei-decks/841c12b4-cbef-44be-9a8a-92811313fec6.json"
import g from "../kotei-decks/0cc6fa50-420d-4b2c-af35-950e758763c4.json"
import h from "../kotei-decks/fd62e088-d52b-4282-910a-153ede3f9ed9.json"


type Decklist = [id: string, count: number][]

const cards = await fetchCards()

class NameEngine {
  #targets: { card: Card, count: number }[]
  #randomRatio = new Map<string, number>()

  constructor(decklist: Decklist) {
    this.#targets = Array.from(decklist.reduce((acc, [id, count]) => {
      const card = cards.get(id)
      if (card?.side === 'dynasty' && card?.type === 'character' && !card.is_unique) {
        acc.set(card, count)
        this.#randomRatio.set(card.id, Math.random())
      }
      return acc
    }, new Map<Card, number>()).entries()).map(e => ({
      card: e[0], count: e[1]
    }))
  }

  revealed(revCards: Card[]) {
    for (const r of revCards) {
      const entry = this.#targets.find(p => p.card.id === r.id)
      if (entry) {
        entry.count -= 1
      }
    }
  }

  cardToName() {
    this.#targets.sort((a, b) => {
      const aReturn = a.count * Math.min(parseInt(a.card.cost ?? '0'), 3)
      const bReturn = b.count * Math.min(parseInt(b.card.cost ?? '0'), 3)

      const expectedReturn = bReturn - aReturn
      if (expectedReturn !== 0) { return expectedReturn }

      return (this.#randomRatio.get(b.card.id) ?? 0) - (this.#randomRatio.get(a.card.id) ?? 0)
    })
    return this.#targets[0].card
  }

}

async function main() {
  runDeck(Object.entries(a.cards), 'Lion AFWTD')

  runDeck(Object.entries(b.cards), 'Crab Zerkers Captive')

  runDeck(Object.entries(c.cards), 'Lion Corner Captive')

  runDeck(Object.entries(d.cards), 'Crane HUGE BODIES')

  runDeck(Object.entries(e.cards), 'Dragon Mitsu')

  runDeck(Object.entries(f.cards), 'Phoenix Decoy')

  runDeck(Object.entries(g.cards), 'Uni EW Shuggies')

  runDeck(Object.entries(h.cards), 'Scorp Ceaseless Duty')
}

function runDeck(decklist: Decklist, vs: string) {
  console.log(`### RUNNING VS ${vs}`)
  let totalWhiffs = 0
  let totalSavedFate = 0
  for (let game = 1; game <= 5; game++) {
    console.log(`== GAME ${game}==`)
    const res = runGame(decklist)
    totalWhiffs += res.whiffs
    totalSavedFate += res.savedFate
  }
  console.log(`TOTAL WHIFFS: ${percent(totalWhiffs / 25)} || AVERAGE FATE GAIN: ${(totalSavedFate / 5).toFixed(1)}`)
  console.log()
}

function percent(n: number) {
  return `${(n * 100).toFixed(0)}%`

}

function runGame(decklist: Decklist) {
  const dynastyDeck = decklist.flatMap(([id, count]) => {
    const card = cards.get(id)
    if (!card) { return [] }
    if (card.side !== 'dynasty') { return [] }

    const copies = Array.from({ length: count }, () => card)


    return copies
  })
  shuffleArray(dynastyDeck)

  const namer = new NameEngine(decklist)
  let oldDeck = dynastyDeck
  let whiffs = 0
  let savedFate = 0
  for (let round = 1; round <= 5; round++) {
    const [revealed, newDeck] = take(4, oldDeck)
    oldDeck = newDeck
    namer.revealed(revealed)


    const namedCard = namer.cardToName()
    const top3 = oldDeck.slice(0, 3)
    const valid = top3.filter(c => c.type === 'character' && !c.is_unique)
    const hit = valid.some(c => c.id === namedCard.id)
    console.log(`Round ${round}: Found ${valid.length} targets. Costs: ${valid.map(c => c.cost).sort().join(", ")}. Named ${namedCard.id} ${hit ? 'CORRECTLY' : 'incorrectly'}!`)
    if (hit) {
      savedFate += Math.min(parseInt(namedCard.cost ?? '0'), 3)
    }
    if (valid.length === 0) {
      whiffs += 1
    }
  }
  console.log(`Whiffed ${whiffs}. Saved ${savedFate}`)
  console.log()
  return { whiffs, savedFate }
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function take<T>(n: number, array: T[]): [T[], T[]] {
  return [
    array.slice(0, n),
    array.slice(n)
  ]
}

main()
