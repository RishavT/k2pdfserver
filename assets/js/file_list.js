var allFiles = [];
output = [];
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('Seems like this application is not supported on your computer, sorry.');
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  files = evt.dataTransfer.files; // FileList object.
  fragment = document.createDocumentFragment()

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

    converstionStatusSpan = document.createElement('span')
    converstionStatusSpan.className = 'conversion-status'
    converstionStatusSpan.id = f.id + '-conversion-status'
    converstionStatusSpan.appendChild(progressBar)


    deleteButton = document.createElement('button')
    deleteButton.className = 'delete-button icon icon-cancel'
    // deleteButton.innerHTML = 'Remove'
    deleteButton.addEventListener('click', function () { removeFile(this) })

    fileMediaBody.appendChild(fileNameSpan)
    fileMediaBody.appendChild(converstionStatusSpan)
    fileMediaBody.appendChild(deleteButton)

    fileLi.appendChild(fileMediaBody)

    fragment.appendChild(fileLi)
    allFiles.push(f)

  }
  document.getElementById('list').appendChild(fragment)
  // Hide file list empty element
  $(".file-div-empty").hide()
  $(".file-div-occupied").show()
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
