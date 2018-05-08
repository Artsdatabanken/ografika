const io = require("../../lib/io");
const http = require("../../lib/http");
const config = require("../../config");
const log = require("log-fancy")("art");
const typesystem = require("@artsdatabanken/typesystem");

log.warn("---");
const fotos = io.lesKildedatafil("NA_foto");
async function download(kode) {
  const url = fotos[kode].foto;
  log.info("Laster ned", kode, url);
  const targetFile =
    `${config.imagePath.omslag}/${typesystem.Natursystem.prefix}/${kode}` +
    ".jpg";
  if (!io.fileExists(targetFile)) {
    log.info("not in cache", targetFile);
    await http.getBinaryFromCache(url, targetFile);
  }
}

async function downThemAll() {
  const keys = Object.keys(fotos);
  for (let i = 0; i < keys.length; i++) await download(keys[i]);
}

downThemAll().then(x => log.success("Done."));
