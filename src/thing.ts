const a = `
Uber490,00 krProcessing at storeJuly 29

Uber0,00 krProcessing at storeJuly 29

Restauracja Gate 555,49 krPart of Monthly InvoicePayJuly 29

Gett610,52 krProcessing at storeJuly 29

Gett0,00 krProcessing at storeJuly 28

Dizingof60,16 krProcessing at storeJuly 28

Pizzeria Bar Ltd1 102,93 krPart of Monthly InvoicePayJuly 28

Tamara Yogorty68,75 krPart of Monthly InvoicePayJuly 28

Mententen624,52 krProcessing at storeJuly 28

Cafe Lev45,84 krProcessing at storeJuly 28

Ministry Of Transpor68,75 krPart of Monthly InvoicePayJuly 28

Or Shpitz114,03 krPart of Monthly InvoicePayJuly 27

Yalla Beera Ltd199,55 krPart of Monthly InvoicePayJuly 27

Milk57,01 krPart of Monthly InvoicePayJuly 27

Ministry Of Transpor111,18 krPart of Monthly InvoicePayJuly 27

Rav Hen Dizingoft242,93 krPart of Monthly InvoicePayJuly 26

Tati Ilan's180,05 krPart of Monthly InvoicePayJuly 26

Prima Hotels Israel Ltd5 266,67 krPart of Monthly InvoicePayJuly 26

Ministry Of Transpor67,16 krPart of Monthly InvoicePayJuly 26

Israel Rail-lehavim154,33 krPart of Monthly InvoicePayJuly 26

Herbet Samuel Yam Hamelch354,19 krPart of Monthly InvoicePayJuly 26

Ministry Of Transpor137,18 krPart of Monthly InvoicePayJuly 26

Prima Hotels Israel Ltd2 291,80 krPart of Monthly InvoicePayJuly 25

Aroma Dead Sea96,00 krPart of Monthly InvoicePayJuly 25

Dan Jerusalem Hotel808,36 krPart of Monthly InvoicePayJuly 25

Cafe Denya139,00 krPart of Monthly InvoicePayJuly 24

Hundred Beers Ltd185,33 krPart of Monthly InvoicePayJuly 24

Pelephon Tikshorret282,91 krPart of Monthly InvoicePayJuly 24

The Welcome Gift Shop188,23 krPart of Monthly InvoicePayJuly 24

Ministry Of Transpor63,71 krPart of Monthly InvoicePayJuly 24

Dan Jerusalem Hotel124,52 krPart of Monthly InvoicePayJuly 23

Dan Jerusalem Hotel3 960,09 krPart of Monthly InvoicePayJuly 23

Holy Cafe617,97 krPart of Monthly InvoicePayJuly 23

Cafe Denya57,92 krPart of Monthly InvoicePayJuly 23

Ministry Of Transpor31,85 krPart of Monthly InvoicePayJuly 23

Israel Museum Products Lt579,16 krPart of Monthly InvoicePayJuly 22

Meshek Apeim199,81 krPart of Monthly InvoicePayJuly 22

Meshek Apeim318,54 krPart of Monthly InvoicePayJuly 22

Mouka Restaurant502,34 krPart of Monthly InvoicePayJuly 21

Ministry Of Transpor132,12 krPart of Monthly InvoicePayJuly 21

Hamaayan Ltd98,28 krPart of Monthly InvoicePayJuly 20

Salman Al Tamimi Jewelry243,88 krPart of Monthly InvoicePayJuly 19

Dan Jerusalem Hotel735,95 krPart of Monthly InvoicePayJuly 19

Dan Jerusalem Hotel8 416,41 krPart of Monthly InvoicePayJuly 19

Israel Rail-tel Aviv137,72 krPart of Monthly InvoicePayJuly 19

Ministry Of Transpor63,12 krPart of Monthly InvoicePayJuly 19

Or Rashby Ltd309,88 krPart of Monthly InvoicePayJuly 19

Baliinzra568,22 krPart of Monthly InvoicePayJuly 18

Atoma79,95 krPart of Monthly InvoicePayJuly 18

Pinat Azmal82,93 krPart of Monthly InvoicePayJuly 17

Taste Of Colombia383,19 krPart of Monthly InvoicePayJuly 17

Museum Tel Aviv Leomanut285,96 krPart of Monthly InvoicePayJuly 17

Ministry Of Transpor31,46 krPart of Monthly InvoicePayJuly 17

Haparlament22,88 krPart of Monthly InvoicePayJuly 17

Gazoz Beach397,49 krPart of Monthly InvoicePayJuly 16

Arte Italian108,67 krPart of Monthly InvoicePayJuly 16

Caffe Benjamintel Aviv114,39 krPart of Monthly InvoicePayJuly 16

Electra Convenience39,75 krPart of Monthly InvoicePayJuly 16

Resturantt120,11 krPart of Monthly InvoicePayJuly 16

McDonald's31,00 krPart of Monthly InvoicePayJuly 15

Sea Dream Hotels Ltd7 785,76 krPaidJuly 9
`;

const b = a
  .split("\n")
  .filter(Boolean)
  .map((s) => {
    const a = s.match(/(\d[^k]*)\sk.*(July .*)/);
    if (!a) {
      throw Error("");
    }

    const price = parseFloat(a[1].replace(",", ".").replace(/\s/, ""));
    const date = a[2];
    return { price, date };
  })
  .reduce((acc, e) => {
    const oldT = acc.get(e.date) ?? 0;
    const newT = oldT + e.price;
    acc.set(e.date, newT);
    return acc;
  }, new Map<string, number>());
console.log(b);
