// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
"use strict";
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
  
  document.querySelectorAll(".drop-zone__input").forEach(element => {
    const dropZoneElement = element.closest(".drop-zone");

    dropZoneElement.addEventListener("dragover", e => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over")
    });

    dropZoneElement.addEventListener("click", () => {
        element.click();
    });

    ["dragleave", "dragend"].forEach(type => {
        dropZoneElement.addEventListener(type, () => {
            dropZoneElement.classList.remove("drop-zone--over")
        })
    });

    dropZoneElement.addEventListener("drop", e => {
        e.preventDefault();

        if([...e.dataTransfer.files].filter(s => s.type === "application/java-archive").length === 0) {
            alert("Wrong file type. We only support jar file")
            dropZoneElement.classList.remove("drop-zone--over");
            return;
        }
        
        const files = [...e.dataTransfer.files].filter(s => s.type === "application/java-archive");
        element.files = fileListItems(files);
        updateThumbnail(dropZoneElement, files[0]);

        dropZoneElement.classList.remove("drop-zone--over");
    });
  });
});

function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
  
  if(dropZoneElement.querySelector(".drop-zone__prompt")) {
      dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }

  if(dropZoneElement.querySelector(".fa-file-upload")) {
      dropZoneElement.querySelector(".fa-file-upload").remove();
  }

  if(!thumbnailElement) {
      thumbnailElement = document.createElement("div");
      thumbnailElement.classList.add("drop-zone__thumb");
      dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;
  thumbnailElement.style.backgroundImage = "url(./assets/jar.svg)"

  //WIP
  sendRequest(file, thumbnailElement);
}

/**
 * @params {File[]} files Array of files to add to the FileList
 * @return {FileList}
 */
 function fileListItems (files) {
  var b = new ClipboardEvent("").clipboardData || new DataTransfer()
  for (var i = 0, len = files.length; i<len; i++) b.items.add(files[i])
  return b.files
}

function isAMCreatorMod(result, element) {
  if(result === "true") {
    alert("This mod is made with MCreator");
  } else {
    alert("This mod is not made with MCreator");
  }

  for(let i = 0; i < element.files; i++) {
    files[i] = undefined;
  }
}

function sendRequest(file, element) {
  const formdata = new FormData();
  formdata.set(file.name, file);

  const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
  };

  fetch("http://minemobs.galaxyfight.fr:8001/upload", requestOptions)
      .then(response => response.text())
      .then(result => {
        isAMCreatorMod(result, element)
        console.log(result)
      })
      .catch(error => {
        alert("The server is down.");
        console.error(error);
      });
}