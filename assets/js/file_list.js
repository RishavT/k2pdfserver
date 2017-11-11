var allFiles = [];

if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('Seems like this application is not supported on your computer, sorry.');
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  files = evt.dataTransfer.files; // FileList object.

  // files is a FileList of File objects. List some properties.
  output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push(
      '<li class="file-list-el" id="li-' + i + '"><span class="file-name">',
      f.name, '</span></li>');
    f.id = "li-" + i;
    allFiles.push(f);
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}
// TODO(rhakker) I was beautifying the lists. Next target, add CSS and icons
// and make a nice looking list. We can do the rest later.

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var body = document.getElementsByTagName("body")[0];
body.addEventListener('dragover', handleDragOver, false);
body.addEventListener('drop', handleFileSelect, false);
