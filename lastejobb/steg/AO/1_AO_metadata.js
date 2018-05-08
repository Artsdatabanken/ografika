if (!process.env.DEBUG) process.env.DEBUG = "*";
const path = require("path");
const io = require("../../lib/io");
const http = require("../../lib/http");
const config = require("../../config");
const log = require("log-fancy")("art");

const kommuner = io.lesKildedatafil("AO_kommune");
const fylker = io.lesKildedatafil("AO_fylke");
const områder = Object.assign({}, kommuner, fylker);

const override = {
  "Indre Fosen": "Leksvik"
};

const overrideSuffiks = {
  Færder: "_komm_2018"
};

const overrideFiltype = {
  Horten: "png",
  Trøndelag: "png"
};

async function downloadImageMeta(nøkkel, suffiks = "komm", filtype = "svg") {
  if (overrideFiltype[nøkkel]) filtype = overrideFiltype[nøkkel];
  if (override[nøkkel]) nøkkel = override[nøkkel];
  if (overrideSuffiks[nøkkel]) suffiks = overrideSuffiks[nøkkel];
  let url = `https://no.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=Fil%3A${encodeURIComponent(
    nøkkel + "_" + suffiks
  )}%2E${filtype}&iiprop=url`;
  const json = await http.getJsonFromCache(
    url,
    config.cachePath + "/våpenskjold/" + nøkkel + "_" + suffiks + ".json"
  );
  const imageinfos = json.query.pages[-1].imageinfo;
  if (!imageinfos) return null;

  const ii = imageinfos[0];
  return { url: ii.url, filtype: filtype, descriptionurl: ii.descriptionurl };
}

async function lastEn(r, kode) {
  const node = områder[kode];
  const fylkeskode = kode.split("-")[0];
  const forelder = områder[fylkeskode];
  const fylkesnavn = forelder !== node ? forelder.tittel.nb : null;
  const navn = node.tittel.nb;
  const suffiks = fylkesnavn || navn == "Oslo" ? "komm" : "våpen";
  let meta = await downloadImageMeta(navn, suffiks);
  if (!meta && forelder)
    meta = await downloadImageMeta(`${navn}_${fylkesnavn}`, suffiks);
  if (meta) {
    r[kode] = Object.assign(
      {
        tittel: navn
      },
      meta
    );
  } else log.warn("Fant ikke meta for " + navn);
}

async function lastVåpen() {
  let r = {};
  for (let key of Object.keys(områder)) await lastEn(r, key);
  return r;
}

lastVåpen().then(r => io.skrivDatafil(__filename, r));
