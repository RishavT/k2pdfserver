function setConversionStatus(f, percentage) {
  conversionId = f.id + '-conversion-status'
  if (percentage === 100) {
    converstionStatus = '<a href=' + f.newPath + '>Done! Click here to download.</a>'
  }
  else if (percentage === -1){
    // Failed
    converstionStatus = 'Failed to convert.'

  }
  else {
    converstionStatus = 'Converting.. ' + percentage + '%'
  }
  document.getElementById(conversionId).innerHTML = converstionStatus
}

function getConversionStatus() {
  window.$.get('http://localhost:8000/get_status').done(function(data){
    newFiles = JSON.parse(data)
    allFinished = true
    for (var i = 0, f; f = newFiles[i]; i ++) {
      converstionStatus = null
      converstionPercentage = null
      allFinished = false
      if (f.convertData.status === 'done') {
        setConversionStatus(f, 100)
        continue;
      }
      else if (f.convertData.status === 'failed') {
        setConversionStatus(f, -1)
        console.log(f.convertData.bufferedError)
      }
      else {
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
          setConversionStatus(f, percentage)
        }
      }
    }
    if (!allFinished) {
      setTimeout(getConversionStatus, 300)
    }
  }).fail(function(error) {
    console.log('Failed to get conversion status ' + error)
    setTimeout(getConversionStatus, 300)
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
        setTimeout(getConversionStatus, 300)
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
