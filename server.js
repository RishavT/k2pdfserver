// Create an app
const shell = require('shelljs')
const server = require('diet')
const fs = require('fs')
const exec = require('child_process').exec
// var Worker = require('webworker-threads').Worker;

app = server()

k2pdfoptPath = 'k2pdfopt'
process.env.K2PDFOPT = "-ui- -x"
shell.config.execPath = '/run/media/LinuxHD/NVM_DIR/versions/node/v9.1.0/bin/electron'
// shell.config.execPath = '/home/rthakker/.nvm/versions/node/v9.1.0/bin/node'
// shell.config.execPath = 'path/to/node/binary'; // Replace this with the real path

// Store the status of k2pdfopt
// status = 'idle'
// Store buffered output
// bufferedOutput = null

newFiles = []

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
    // f.runOutput = shell.exec(command)
    // args = [f.path, '-ui', '-x', '-a-', '-o', newPath]
    spawnedProcess = exec(command)
    f.convertData = {
      bufferedOutput: '',
      status: null
    }

    spawnedProcess.stdout.on('data', function(data) {
      console.log('stdout: ' + data)
      f.convertData.bufferedOutput += '' + data;
    })

    spawnedProcess.on('close', function(code) {
      if (code !== 0) {
        f.convertData.status = 'failed'
      }
      else {
        f.convertData.status = 'done'
      }
    })

    newFiles.push(f)
  }
  // $.end(JSON.stringify({files: newFiles}))
  $.end('Success')
})

app.get('/get_status', function($) {
  $.end(JSON.stringify(newFiles))
  // $.end(newFiles[0].convertData.bufferedOutput)
})

function startServer() {
  app.listen('http://localhost:8000')
}
// var MyServerWorker = new Worker(startServer)
startServer();
