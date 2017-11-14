// Create an app
const server = require('diet')
const exec = require('child_process').exec

app = server()

k2pdfoptPath = '/usr/bin/k2pdfopt'

newFiles = []

app.post('/convert', function($) {
  data = JSON.parse($.body)
  console.log(data)

  newFiles = []
  for (i in data.files) {
    f = data.files[i]
    console.log('Converting ' + f.path)
    newPath = '/tmp/' + f.name + '_converted.pdf'
    command = k2pdfoptPath + ' ' + f.path + ' -ui- -x -a- -o ' + newPath
    f.newPath = newPath
    spawnedProcess = exec(command)
    f.convertData = {
      bufferedOutput: '',
      bufferedError: '',
      status: null
    }

    spawnedProcess.stdout.on('data', function(tempObj) {
      return function(data) {
        console.log('stdout: ' + tempObj.name + data)
        tempObj.convertData.bufferedOutput += '' + data;
      }
    }(f))

    spawnedProcess.stderr.on('data', function(tempObj) {
      return function(error) {
        console.log('stderr: ' + tempObj.name + JSON.stringify(data))
        tempObj.convertData.bufferedError += '' + JSON.stringify(data);
      }
    }(f))

    spawnedProcess.on('close', function(tempObj) {
      return function(code) {
        if (code !== 0) {
          tempObj.convertData.status = 'failed'
        } else {
          tempObj.convertData.status = 'done'
        }
      }
    }(f))

    newFiles.push(f)
  }
  $.end('Success')
})

app.get('/get_status', function($) {
  $.end(JSON.stringify(newFiles))
})

// Set exit function
process.on('message', (msg) => {
  if (msg == 'exit') {
    process.exit()
  }
})

function startServer() {
  app.listen('http://localhost:8000')
}
startServer();
