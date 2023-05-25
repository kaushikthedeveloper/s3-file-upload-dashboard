let bucketName = "s3-bucket-name";
let bucketRegion = "us-east-1";
let identityPoolId = "us-east-1:cognito-identity-pool-id";
let objectKeyPrefix = 'folder-prefix-if-any'

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId,
  }),
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: bucketName },
});

var isAdvancedUpload = (function () {
  var div = document.createElement("div");
  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
})();

// Selectors
let draggableFileArea = document.querySelector(".drag-file-area");
let uploadIcon = document.querySelector(".upload-icon");
let dragDropText = document.querySelector(".dynamic-message");
let browseFilesTextContainer = document.querySelector(
  ".browse-files-text-container"
);
let fileInput = document.querySelector(".default-file-input");
let cannotUploadMessage = document.querySelector(".cannot-upload-message");
let noFileToUploadMessage = document.querySelector(".no-file-upload-message");
let cancelAlertButton = document.querySelector(".cancel-alert-button");
let uploadedFileElement = document.querySelector(".file-block");
let fileNameElement = document.querySelector(".file-name");
let fileSizeElement = document.querySelector(".file-size");
let removeFileButton = document.querySelector(".remove-file-icon");
let uploadButton = document.querySelector(".upload-button");
let progressBar = document.querySelector(".progress-bar");

// reset file upload elements
function resetFileUploadBox() {
  fileInput.value = "";
  progressBar.style.width = 0;
  uploadButton.innerHTML = `Upload`;
  uploadIcon.innerHTML = "file_upload";
  uploadedFileElement.style.cssText = "display: none;";
  dragDropText.innerHTML = "Drag & drop any file here";
  browseFilesTextContainer.style.cssText = "visibility: initial;";
}

// display file details
function onFileSelected(fileName, fileSize) {
  fileNameElement.innerHTML = fileName;
  fileSizeElement.innerHTML = (fileSize / 1024).toFixed(1) + " KB";
  uploadIcon.innerHTML = "file_download";
  dragDropText.innerHTML = "File selected!";
  uploadedFileElement.style.cssText = "display: flex;";
}

function onFileUploadSuccess() {
  uploadButton.innerHTML = `<span class="material-icons-outlined upload-button-icon"> check_circle </span> Uploaded`;
  uploadIcon.innerHTML = "check_circle";
  dragDropText.innerHTML = "File Uploaded Successfully!";
  uploadButton.classList.toggle("completed");
}

function disableFileInputElements(params) {
  browseFilesTextContainer.style.cssText = "visibility: hidden;";
}

fileInput.addEventListener("click", () => {
  // reset file input element
  fileInput.value = "";
});

fileInput.addEventListener("change", (e) => {
  onFileSelected(
    fileInput.files[0].name,
    fileInput.files[0].size,
    fileInput.value
  );
});

cancelAlertButton.addEventListener("click", () => {
  noFileToUploadMessage.style.cssText = "display: none;";
});

removeFileButton.addEventListener("click", () => {
  resetFileUploadBox();
});

// DRAG and DROP functionality
if (isAdvancedUpload) {
  [
    "drag",
    "dragstart",
    "dragend",
    "dragover",
    "dragenter",
    "dragleave",
    "drop",
  ].forEach((evt) =>
    draggableFileArea.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
    })
  );

  ["dragover", "dragenter"].forEach((evt) => {
    draggableFileArea.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadIcon.innerHTML = "file_download";
      dragDropText.innerHTML = "Drop your file here!";
    });
  });

  draggableFileArea.addEventListener("drop", (e) => {
    let files = e.dataTransfer.files;
    fileInput.files = files;
    onFileSelected(files[0].name, files[0].size, fileInput.value);
  });
}

uploadButton.addEventListener("click", () => {
  let fileName = fileInput.files[0]?.name;
  // if file selected
  if (!!fileName) {
    var upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: bucketName,
        Key: `${objectKeyPrefix}/${fileName}`,
        Body: fileInput.files[0],
      },
    }).on("httpUploadProgress", function (progress) {
      // show progress bar based on file upload status
      let progressPercentage = Math.round(
        (progress.loaded / progress.total) * 100
      );
      progressBar.style.width = progressPercentage + "%";
    });

    uploadButton.classList.toggle("disable-button");
    uploadButton.innerHTML = `Uploading...`;
    disableFileInputElements();

    // start file upload
    upload.promise().then(
      function (data) {
        onFileUploadSuccess();

        setTimeout(() => {
          resetFileUploadBox();
          uploadButton.classList.toggle("completed");
          uploadButton.classList.toggle("disable-button");
        }, 3000);
      },
      function (err) {
        cannotUploadMessage.style.cssText =
          "display: flex; animation: fadeIn linear 1.5s;";
        resetFileUploadBox();
        return;
      }
    );
  } else {
    noFileToUploadMessage.style.cssText =
      "display: flex; animation: fadeIn linear 1.5s;";
    resetFileUploadBox();
  }
});
