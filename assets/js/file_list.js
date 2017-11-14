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
    fileLi = document.createElement('li')
    fileLi.id = 'li-' + i
    fileLi.class = 'file-list-el'

    fileNameSpan = document.createElement('span')
    fileNameSpan.class = 'file-name'
    fileNameSpan.id = 'li-' + i + '-name'
    fileNameSpan.innerHTML = f.name

    conversionStatusSpan = document.createElement('span')
    conversionStatusSpan.class = 'file-conversion-status'
    conversionStatusSpan.id = 'li-' + i + '-conversion-status'

    deleteButton = document.createElement('button')
    deleteButton.class = 'delete-button'
    deleteButton.innerHTML = 'Remove'
    deleteButton.addEventListener('click', function () { removeFile(this) })

    fileLi.appendChild(fileNameSpan)
    fileLi.appendChild(conversionStatusSpan)
    fileLi.appendChild(deleteButton)

    fragment.appendChild(fileLi)

  }
  document.getElementById('list').appendChild(fragment)
}
// TODO(rhakker) I was beautifying the lists. Next target, add CSS and icons
// and make a nice looking list. We can do the rest later.

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function removeFile(obj) {
  listElement = obj.parentNode
  idx = listElement.getAttribute('data-idx')
  allFiles.splice(idx, 1)
  listElement.remove()
}

// Setup the dnd listeners.
var body = document.getElementsByTagName("body")[0];
body.addEventListener('dragover', handleDragOver, false);
body.addEventListener('drop', handleFileSelect, false);
