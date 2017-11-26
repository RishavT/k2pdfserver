const path = require('path')
const fs = require('fs')
const download = require('download')

const k2pdfoptURL = 'http://rishavt.github.io/rayk-k2pdfopt/k2pdfopt'
const LocalDir = path.join(process.env['HOME'], '.rayk')
const k2pdfoptPath = path.join(LocalDir, 'k2pdfopt')

var FileExists = false

function initLocalDir() {
  // Initializes the local directory (~/.rayk) for downloading k2pdfopt
  if (!fs.existsSync(LocalDir)){
    fs.mkdirSync(LocalDir, 0o755)
  }
}

function downloadIfRequired(callback) {
  // Downloads k2pdfopt if reuqired
  initLocalDir()
  if (!fs.existsSync(k2pdfoptPath)) {

    download(k2pdfoptURL, LocalDir).then((data) => {
      fs.chmodSync(k2pdfoptPath, 0o755)
      callback(true)
    }).catch((err) => {
      console.log(err)
      callback(false)
    })
  }
  else {
    fs.chmodSync(k2pdfoptPath, 0o755)
    callback(true)
  }
}

module.exports = {
  downloadIfRequired: downloadIfRequired,
  k2pdfoptPath: k2pdfoptPath
}
