require('es6-promise/auto')
require('whatwg-fetch')
const Uppy = require('@uppy/core')
const FileInput = require('@uppy/file-input')
const XHRUpload = require('@uppy/xhr-upload')
const ProgressBar = require('@uppy/progress-bar')

const uppy = new Uppy({ debug: true, autoProceed: true })
uppy.use(FileInput, {
  target: '.UppyForm',
  replaceTargetContent: true
})
uppy.use(ProgressBar, {
  target: '.UppyProgressBar',
  hideAfterFinish: false
})
uppy.use(XHRUpload, {
  endpoint: 'https://upload-endpoint.uppy.io/upload',
  formData: true,
  fieldName: 'files[]'
})

// And display uploaded files
uppy.on('upload-success', (file, response) => {
  const url = response.uploadURL
  const fileName = file.name

  document.querySelector('.uploaded-files ol').innerHTML +=
    `<li><a href="${url}" target="_blank">${fileName}</a></li>`
})
