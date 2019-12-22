const electron = require("electron")

function alertAndQuit(message) {
	alert(message)
	electron.remote.getCurrentWindow().close()
}

function saveProgress(f, percentage) {
  progressBarId = f.id + '-progress-bar'
  conversionStatusId = f.id + '-conversion-status'
  if (percentage === 100) {
    conversionStatus = '<a href="' + f.newPath + '">Done! Click here to download.</a>'
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

function getProgress(callback) {
  // Gets the progress of conversion from backend
  window.$.get('http://localhost:8000/get_status').done(function(data){
    newFiles = JSON.parse(data)
    allFinished = true
    for (var i = 0, f; f = newFiles[i]; i ++) {
      conversionStatus = null
      conversionPercentage = null
      if (f.convertData.status === 'done') {
        saveProgress(f, 100)
	    sendFiles()
        continue;
      }
      else if (f.convertData.status === 'failed') {
        saveProgress(f, -1)
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
          saveProgress(f, percentage)
        }
      }
    }
    if (!allFinished) {
      setTimeout(getProgress, 300)
    }
	if (callback) callback(newFiles);
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
		setTimeout(getProgress, 300)
      }
      else {
        alertAndQuit('Conversion failed. Please restart Rayk and try again.')
        console.log('Conversion failed. Please restart Rayk and try again')
      }
    }
  }

  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify({
    files: parsedFiles
  }));

}

function sendFiles(count) {
  if (typeof(count) !== "number" || count === undefined) {
	  count = 1
  }
  xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
  xmlhttp.open("GET", "http://localhost:8000/send_files", true);

  xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 ) {
		getProgress(function(newFiles) {
			if (newFiles.length > 1) {
				alertAndQuit("An error occured. Please restart Rayk and try again")
				return
			}
			for (i in newFiles) {
			  f = newFiles[i]
			  
			  // Send only converted files
			  if (f.convertData.status !== 'done') {
				  continue
			  }
			  elementId = f.id + "-send-status"
			  if (f.sentToKindle) {
				innerHTML = "Sent to Kindle!"
			  }
			  else {
				if (count < 5) {
					setTimeout(sendFiles, 300, count + 1)
					return
				}
				alert("Failed to send " + f.name + " to Kindle. Please retry")
				cleanUp()
				return
			  }
			  document.getElementById(elementId).innerHTML = innerHTML
			  setTimeout(cleanUp, 300)
			}
		})
	}
  }

  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send()
  
}

function cleanUp(oldFiles) {
	// Cleans up the already processed/failed files, preparing for more file conversion.
	
	if (oldFiles === null || oldFiles === undefined) {
		// Call getProgress once to fetch file list before cleanup to see which ones have been
		// sent to Kindle
		getProgress(cleanUp)
		return
	}
	else if (oldFiles.length === 0) return
	else if (oldFiles.length !== 1) alertAndQuit("An error occured. Please restart Rayk and try again")
	
	// Clean up
	xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
	xmlhttp.open("GET", "http://localhost:8000/cleanup", true);
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status !== 200) {
				alertAndQuit("An error occured. Please restart Rayk and try again")
			}
			getProgress(function (newFiles){
				if (newFiles.length != 0) {
					alertAndQuit("An error occured. Please restart Rayk and try again")
					return
				}
				oldParent = document.getElementById("list")
				oldFileElement = oldFiles[0]
				listElementId = "li-0"
				listElement = document.getElementById(listElementId)
				if (oldFileElement.sentToKindle !== true) {
					listElement.parentNode.removeChild(listElement)
				}
				else if (listElement.parentNode === oldParent) {
					newParent = document.getElementById("completed-file-list")
					newParent.appendChild(listElement)
				}
				if (oldParent.childNodes.length > 0) {
					alertAndQuit("An error occured. Please restart Rayk and try again")
				}
				allFiles = []
				if (openedWith) {
					alertAndQuit("Done!")
				}
			})
		}
	}
	xmlhttp.send();
}
