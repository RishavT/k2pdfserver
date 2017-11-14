function setProgress(f, percentage) {
  progressBarId = f.id + '-progress-bar'
  conversionStatusId = f.id + '-conversion-status'
  if (percentage === 100) {
    conversionStatus = '<a href=' + f.newPath + '>Done! Click here to download.</a>'
    document.getElementById(conversionStatusId).innerHTML = conversionStatus
  }
  else if (percentage === -1){
    // Failed
    conversionStatus = 'Failed to convert.'
    document.getElementById(conversionStatusId).innerHTML = conversionStatus
  }
  else {
    progressBar = document.getElementById(progressBarId)
    progressBar.style.display = 'inline'
    progressBar.value = percentage
  }
}

function getProgress() {
  window.$.get('http://localhost:8000/get_status').done(function(data){
    newFiles = JSON.parse(data)
    allFinished = true
    for (var i = 0, f; f = newFiles[i]; i ++) {
      conversionStatus = null
      conversionPercentage = null
      allFinished = true
      if (f.convertData.status === 'done') {
        setProgress(f, 100)
        continue;
      }
      else if (f.convertData.status === 'failed') {
        setProgress(f, -1)
        console.log(f.convertData.bufferedError)
      }
      else {
        allFinished = false
        lines = f.convertData.bufferedOutput.split('\n')
        last_line = lines[lines.length-1]
        last_line = last_line.split(' of ')
        if (last_line.length !== 1) {
          result = [last_line[last_line.length-2], last_line[last_line.length-1]]
          result[0] = result[0].trim().split(' ')
          result[0] = result[0][result[0].length-1]
          result[1] = result[1].trim().split(' ')
          result[1] = result[1][0]
          percentage = Math.round(result[0] / result[1] * 100)
          setProgress(f, percentage)
        }
      }
    }
    if (!allFinished) {
      setTimeout(getProgress, 300)
    }
  }).fail(function(error) {
    console.log('Failed to get progress ' + error)
    setTimeout(getProgress, 300)
  })
}

function convertFiles() {
  parsedFiles = allFiles.map(function(x) {
    return {
      path: x.path,
      name: x.name,
      id: x.id
    }
  });

  xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
  xmlhttp.open("POST", "http://localhost:8000/convert", true);

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      responseData = this.responseText
      // for (var i = 0, f; f = responseData.files[i]; i ++) {
      //   innerHTML = '<strong>' +  f.name + '</strong>: <a href=' + f.newPath + '>Done! Click here to download.</a>';
      //   document.getElementById(f.id).innerHTML = innerHTML;
      //
      // }
      if (responseData === 'Success') {
        console.log('wew')
        setTimeout(getProgress, 300)
      }
      else {
        alert('Conversion failed. Please restart the application and try again.')
        console.log('Conversion failed. Please restart the application and try again')
      }
    }
  }

  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify({
    files: parsedFiles
  }));

}
