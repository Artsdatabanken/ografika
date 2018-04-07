if (!process.env.DEBUG) process.env.DEBUG = '*'

const config = {
  kildeDataPath: './kildedata/',
  datafil: {
    våpenskjold_meta: '../data/våpenskjold_meta.json'
  },
  imagePath: {
    avatar: '../avatar',
    omslag: '../omslag'
  },
  prefix: {
    administrativtOmråde: 'AO'
  },
  cachePath: '../cache',
  dataPath: '../data',
  getCachePath: function(relPath) {
    return this.cachePath + '/' + relPath + '/'
  },
  getDataPath: function(relPath, extension = '.json') {
    let i = relPath.lastIndexOf('/')
    i = relPath.lastIndexOf('/', i - 1)
    const stegOgNavn = relPath.substring(i).replace(/.js$/, extension)
    return this.dataPath + '/' + stegOgNavn.replace('.test', '')
  }
}

module.exports = config
