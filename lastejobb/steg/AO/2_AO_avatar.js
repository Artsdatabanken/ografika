if (!process.env.DEBUG) process.env.DEBUG = '*'
const config = require('../config')
const io = require('../io')
const http = require('../http')
const log = require('log-fancy')('art')

const meta = io.readJson(config.datafil.våpenskjold_meta)

async function lastEn(kode) {
  const node = meta[kode]
  const targetFile = `${config.imagePath.avatar}/${
    config.prefix.administrativtOmråde
  }/${kode}.${node.filtype}`
  if (io.fileExists(targetFile)) return
  const json = await http.getBinaryFromCache(node.url, targetFile)
}

async function lastVåpen() {
  for (let key of Object.keys(meta)) await lastEn(key)
  return
}

lastVåpen().then(r => log.success('Done.'))
