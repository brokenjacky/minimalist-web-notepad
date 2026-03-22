function uploadContent() {

    // If textarea value changes.
    if (content !== textarea.value) {
        var temp = textarea.value;
        var request = new XMLHttpRequest();

        request.open('POST', window.location.href, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.onload = function() {
            if (request.readyState === 4) {

                // Request has ended, check again after 1 second.
                content = temp;
                setTimeout(uploadContent, 1000);
            }
        }
        request.onerror = function() {

            // Try again after 1 second.
            setTimeout(uploadContent, 1000);
        }
        request.send('text=' + encodeURIComponent(temp));

        // Make the content available to print.
        printable.removeChild(printable.firstChild);
        printable.appendChild(document.createTextNode(temp));
    }
    else {

        // Content has not changed, check again after 1 second.
        setTimeout(uploadContent, 1000);
    }
}

// Upload an image file to the server and insert a Markdown image link at the cursor.
function uploadImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        return;
    }
    var status = document.getElementById('uploadStatus');
    status.textContent = '上传中...';

    var formData = new FormData();
    formData.append('file', file);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                var resp = JSON.parse(xhr.responseText);
                var mdImg = '![image](' + resp.url + ')';
                insertAtCursor(textarea, mdImg);
                status.textContent = '上传成功';
                setTimeout(function() { status.textContent = ''; }, 2000);
            } catch(e) {
                status.textContent = '上传失败';
            }
        } else {
            status.textContent = '上传失败：' + xhr.status;
        }
    };
    xhr.onerror = function() {
        status.textContent = '上传失败';
    };
    xhr.send(formData);
}

// Insert text at the textarea cursor position.
function insertAtCursor(el, text) {
    var start = el.selectionStart;
    var end = el.selectionEnd;
    var before = el.value.substring(0, start);
    var after = el.value.substring(end);
    el.value = before + text + after;
    el.selectionStart = el.selectionEnd = start + text.length;
    el.focus();
}

var textarea = document.getElementById('content');
var printable = document.getElementById('printable');
var content = textarea.value;

// Make the content available to print.
printable.appendChild(document.createTextNode(content));

// Upload button triggers file picker.
var uploadBtn = document.getElementById('uploadBtn');
var fileInput = document.getElementById('fileInput');

uploadBtn.addEventListener('click', function() {
    fileInput.click();
});

fileInput.addEventListener('change', function() {
    if (fileInput.files && fileInput.files[0]) {
        uploadImageFile(fileInput.files[0]);
        fileInput.value = '';
    }
});

// Paste image (Ctrl+V).
textarea.addEventListener('paste', function(e) {
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
            e.preventDefault();
            var file = items[i].getAsFile();
            uploadImageFile(file);
            return;
        }
    }
});

// Drag and drop image.
textarea.addEventListener('dragover', function(e) {
    e.preventDefault();
    textarea.style.borderColor = '#4a9eff';
});

textarea.addEventListener('dragleave', function(e) {
    textarea.style.borderColor = '';
});

textarea.addEventListener('drop', function(e) {
    e.preventDefault();
    textarea.style.borderColor = '';
    var files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
        uploadImageFile(files[0]);
    }
});

textarea.focus();
uploadContent();
