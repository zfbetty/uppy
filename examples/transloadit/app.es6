require('es6-promise/auto')
require('whatwg-fetch')
const Uppy = require('@uppy/core')
const Dashboard = require('@uppy/dashboard')
const Webcam = require('@uppy/webcam')
const Transloadit = require('@uppy/transloadit')
const Instagram = require('@uppy/instagram')
const Facebook = require('@uppy/facebook')
const { createHmac } = require('crypto')
const COMPANION = require('../env')

function sha1 (key, text) {
  return createHmac('sha1', key)
    .update(text)
    .digest('hex')
}

function initUppy (opts = {}) {
  if (window.uppy) {
    window.uppy.close()
  }

  const uppy = Uppy({
    debug: true,
    autoProceed: false,
    restrictions: {
      maxFileSize: 1024 * 1024 * 1024,
      maxNumberOfFiles: 2,
      minNumberOfFiles: 1,
      allowedFileTypes: ['image/*']
    },
    locale: {
      strings: {
        youCanOnlyUploadFileTypes: 'You can only upload images'
      }
    }
  })

  function getExpiration (future) {
    return new Date(Date.now() + future)
      .toISOString()
      .replace('T', ' ')
      .replace(/\.\d+Z$/, '+00:00')
  }

  function getAssemblyOptions () {
    const hasSecret = opts.secret != null
    let params = {
      auth: {
        key: window.TRANSLOADIT_API_KEY,
        expires: hasSecret ? getExpiration(5 * 60 * 1000) : undefined
      },
      // It's more secure to use a template_id and enable
      // Signature Authentication
      steps: {
        resize: {
          robot: '/image/resize',
          width: 250,
          height: 250,
          resize_strategy: 'fit',
          text: [
            {
              text: `© ${(new Date).getFullYear()} Transloadit.com`,
              size: 12,
              font: 'Ubuntu',
              color: '#eeeeee',
              valign: 'bottom',
              align: 'right',
              x_offset: 16,
              y_offset: -10
            }
          ]
        }
      }
    }

    let signature
    if (opts.secret) {
      params = JSON.stringify(params)
      signature = sha1(opts.secret, params)
    }

    return { params, signature }
  }

  let instagramOptions = {
    target: Dashboard,
    companionUrl: 'https://api2.transloadit.com/companion',
    companionAllowedHosts: Transloadit.COMPANION_PATTERN
  }
  if (document.location.hash === '#enable-new-instagram') {
    instagramOptions = {
      target: Dashboard,
      companionUrl: 'https://intense-meadow-61813.herokuapp.com/'
    }
  }

  uppy
    .use(Transloadit, {
      getAssemblyOptions,
      waitForEncoding: true
    })
    .use(Dashboard, {
      inline: true,
      maxHeight: 400,
      target: '#uppy-dashboard-container',
      note: 'Images only, 1–2 files, up to 1 MB'
    })
    .use(Instagram, instagramOptions)
    .use(Facebook, {
      target: Dashboard,
      companionUrl: COMPANION
    })
    .use(Webcam, { target: Dashboard, modes: ['picture'] })

  uppy
    .on('transloadit:result', (stepName, result) => {
      const file = uppy.getFile(result.localId)
      var resultContainer = document.createElement('div')
      resultContainer.innerHTML = `
        <div>
          <h3>Name: ${file.name}</h3>
          <img src="${result.ssl_url}" /> <br />
          <a href="${result.ssl_url}" target="_blank">View</a>
        </div>
      `
      document
        .getElementById('uppy-transloadit-result')
        .appendChild(resultContainer)
    })
}

window.initUppy = initUppy
