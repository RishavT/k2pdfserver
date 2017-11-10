// Create an app
const shell = require('shelljs')
const server = require('diet')
app = server()

k2pdfoptPath = '/home/rthakker/Desktop/k2pdfopt'
process.env.K2PDFOPT = "-ui- -x"

shell.config.execPath = '/home/rthakker/.nvm/versions/node/v9.1.0/bin/node'
// shell.config.execPath = 'path/to/node/binary'; // Replace this with the real path

// Only keeping one post endpoint because electron app. Nothing else is needed.
app.post('/convert', function($) {
  data = JSON.parse($.body)
  console.log(data)

  newFiles = []
  for (i in data.files) {
    f = data.files[i]
    console.log('Converting ' + f.path)
    newPath = '/tmp/' + f.name + '_converted.pdf'
    command = k2pdfoptPath  + ' ' + f.path + ' -ui- -x -a- -o ' + newPath
    f.newPath = newPath
    f.runOutput = shell.exec(command)
    newFiles.push(f)
  }
  $.end(JSON.stringify({files: newFiles}))
})

var start = function() {
  return new Promise((resolve, reject) => {
    app.listen('http://localhost:8000')
  })
}

start()
