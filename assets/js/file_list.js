const remote = require("electron")

var allFiles = [];
output = [];
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('Seems like this application is not supported on your computer, sorry.');
}

function handleFileSelect(evt, files) {

  if (evt !== undefined && evt !== null) {
	  evt.stopPropagation();
	  evt.preventDefault();

	  files = evt.dataTransfer.files; // FileList object.
  }
  else if (files == undefined || files == null) {
	  console.log("handleFileSelect requires either evt or files as argument")
	  return
  }
  fragment = document.createDocumentFragment()

  if (allFiles.length > 0) {
	  alert("Please wait for the current file to finish")
	  return
  }
  
  if (files.length > 1) {
	  alert("Please select a single file")
	  return
  }

  // files is a FileList of File objects. List some properties.
  for (var i = 0, f; f = files[i]; i++) {
    f.id = 'li-' + i

    fileLi = document.createElement('li')
    fileLi.id = f.id
    fileLi.name = i
    fileLi.className = 'file-list-el list-group-item'

    fileMediaBody = document.createElement('div')
    fileMediaBody.className = 'media-body'

    fileNameSpan = document.createElement('span')
    fileNameSpan.className = 'file-name'
    fileNameSpan.id = f.id + '-name'

    if (f.name.length > 40) {

       fileNameSpan.innerHTML = f.name.substring(0,40) + '...'
    }
    else {
      fileNameSpan.innerHTML = f.name.substring(0,40)
    }

    fileNameSpan.title = f.name

    progressBar = document.createElement('progress')
    progressBar.className = 'progress-bar'
    progressBar.id = f.id + '-progress-bar'
    progressBar.value = 0
    progressBar.max = 100

    conversionStatusSpan = document.createElement('span')
    conversionStatusSpan.className = 'conversion-status'
    conversionStatusSpan.id = f.id + '-conversion-status'
    conversionStatusSpan.appendChild(progressBar)

    sendStatusSpan = document.createElement('span')
    sendStatusSpan.className = 'send-status'
    sendStatusSpan.id = f.id + '-send-status'

    deleteButton = document.createElement('button')
    deleteButton.className = 'delete-button icon icon-cancel'
    // deleteButton.innerHTML = 'Remove'
    deleteButton.addEventListener('click', function () { removeFile(this) })

    fileMediaBody.appendChild(fileNameSpan)
    fileMediaBody.appendChild(conversionStatusSpan)
    fileMediaBody.appendChild(sendStatusSpan)
    fileMediaBody.appendChild(deleteButton)

    fileLi.appendChild(fileMediaBody)

    fragment.appendChild(fileLi)
    allFiles.push(f)

  }
  document.getElementById('list').appendChild(fragment)
  // Hide file list empty element
  $(".file-div-empty").hide()
  $(".file-div-occupied").show()
  
  // Automatically start conversion
  setTimeout(convertFiles, 300)
}
// TODO(rhakker) I was beautifying the lists. Next target, add CSS and icons
// and make a nice looking list. We can do the rest later.

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function removeFile(obj) {
  listElement = obj.parentNode.parentNode
  idx = listElement.name
  // $.post(
  //     'http://localhost:8000/cancel',
  //     {file: allFiles[idx]},
  //     function(idx, listElement) {
  //       return function(data, status) {
  //         allFiles.splice(idx, 1)
  //         listElement.remove()
  //       }(idx, listElement)
  //     }
  //   )
  xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
  xmlhttp.open("POST", "http://localhost:8000/cancel", true);

  xmlhttp.onreadystatechange = function(idx, listElement) {
    return function(data, status) {
      if (xmlhttp.readyState == 4) {
        allFiles.splice(idx, 1)
        listElement.remove()
      }
    }
  }(idx, listElement)

  xmlhttp.send(JSON.stringify({
    fileToDelete: allFiles[idx]
  }));
}

// Setup the dnd listeners.
var body = document.getElementsByTagName("body")[0];
body.addEventListener('dragover', handleDragOver, false);
body.addEventListener('drop', handleFileSelect, false);
