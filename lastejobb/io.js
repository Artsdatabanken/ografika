const log = require('log-fancy')('io')
const fs = require('fs-extra')
const path = require('path')
const fetch = require('node-fetch')

function capitalizeTittel(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function getLength(o) {
  if (o.length) return o.length
  return Object.keys(o).length
}

function fetchJson(url) {
  const data = fetch(url)
  return JSON.parse(data)
}

function skrivLoggLinje(aksjon, filePath, json) {
  let produsert = null
  if (json.meta && json.meta.produsert)
    produsert = new Date(json.meta.produsert)
  else produsert = new Date(fs.statSync(filePath).ctime)
  const now = new Date()
  const timerGammel = Math.round(10 * (now - produsert) / 1000 / 60 / 60) / 10

  if (json.data) json = json.data
  log.info(
    'Lest ' +
      getLength(json) +
      ' elementer fra ' +
      timerGammel +
      ' timer gammel fil.'
  )
}

function readCsv(filePath, delimiter = ';') {
  log.info('Åpner ' + filePath)
  const data = fs.readFileSync(filePath, 'utf8')
  const rows = data.toString().split('\n')
  const fields = rows
    .splice(0, 1)[0]
    .trim('\r')
    .split(delimiter)
  var r = []
  rows.forEach(line => {
    let row = line.split(';')
    let record = {}
    for (let i = 0; i < fields.length; i++) record[fields[i]] = row[i]
    r.push(record)
  })
  return r
}

function readJson(filePath) {
  log.info('Åpner ' + filePath)
  let data = fs.readFileSync(filePath, 'utf8')
  //  data = data.replace(/^\uFEFF/, '') // node #fail https://github.com/nodejs/node/issues/6924
  if (data.charCodeAt(0) === 0xfeff) data = data.slice(1)
  log.debug('File size: ' + data.length + ' bytes')
  let json = JSON.parse(data)
  delete json.meta
  if (Object.keys(json).length === 1) json = json[Object.keys(json)[0]]
  skrivLoggLinje('Lest', filePath, json)
  return json
}

function readBinary(filePath) {
  log.info('Åpner ' + filePath)
  const data = fs.readFileSync(filePath, 'utf8')
  return data
}

function writeJson(filePath, o) {
  const basename = path.basename(filePath, '.json')
  let dokument = Array.isArray(o) ? { data: o } : o
  dokument.meta = {
    tittel: capitalizeTittel(basename.replace(/_/g, ' ')),
    produsert: new Date().toJSON(),
    utgiver: 'Artsdatabanken',
    url: `https://firebasestorage.googleapis.com/v0/b/grunnkart.appspot.com/o/koder%2F${path.basename(
      filePath
    )}?alt=media`,
    elementer: getLength(o)
  }
  writeBinary(filePath, JSON.stringify(dokument))
  log.info('Skrevet ' + getLength(o) + ' elementer')
}

function writeBinary(filePath, o) {
  if (!filePath) throw new Error('Filename is required')
  if (!o) throw new Error('No data provided')
  log.info('Writing ' + filePath)
  const dir = path.dirname(filePath)
  mkdir(dir)
  fs.writeFileSync(filePath, o, 'utf8')
  log.info('Skrevet ' + o.length + ' bytes')
}

function mkdir(path) {
  fs.ensureDirSync(path)
}

function fileExists(path) {
  return fs.existsSync(path)
}

// Recursive find files in startPath satisfying filter
function findFiles(startPath, filter) {
  let r = []
  var files = fs.readdirSync(startPath)
  for (var file of files) {
    var filename = path.join(startPath, file)
    var stat = fs.lstatSync(filename)
    if (stat.isDirectory()) {
      r = r.concat(findFiles(filename, filter))
    } else if (filter && filter !== path.parse(filename).ext) {
    } else r.push(filename)
  }
  return r
}

module.exports = {
  readBinary,
  readJson,
  readCsv,
  writeBinary,
  writeJson,
  fetchJson,
  findFiles,
  fileExists,
  mkdir
}
