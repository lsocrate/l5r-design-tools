import { Card, fetchCards } from "./client/emdb.js";

const cards = await fetchCards()

const attachments = {
  cs: new Set(),
  ts: [] as string[]
}
const attachmentsEL = {
  cs: new Set(),
  ts: [] as string[]
}

const elpacks = new Set(['through-the-mists', 'core-set-2', 'restoration-of-balance', 'ancient-secrets'])

for (const c of cards.values()) {
  if (c.type === 'attachment') {
    attachments.cs.add(c)
    attachments.ts.push(...(c.traits ?? []))

    if (c.versions.some(v => elpacks.has(v.pack_id))) {
      attachmentsEL.cs.add(c)
      attachmentsEL.ts.push(...(c.traits ?? []))
    }
  }
}

group(attachmentsEL.ts)


function group(ss: string[]) {
  const g = ss.reduce((acc, s) => {
    acc.set(s, (acc.get(s) ?? 0) + 1)
    return acc
  }, new Map<string, number>())
  console.log(Array.from(g).sort((a, b) => b[1] - a[1]).map(p => p.join(": ")).join("\n"))
}
