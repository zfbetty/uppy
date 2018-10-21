require('es6-promise/auto')
require('whatwg-fetch')
const Uppy = require('@uppy/core')
const Dashboard = require('@uppy/dashboard')
const Url = require('@uppy/url')
const Tus = require('@uppy/tus')

const isEdge = navigator.userAgent.match(/Edge\/(\d+)/)

Uppy({
  id: 'uppyProvider',
  debug: true
})
  .use(Dashboard, {
    target: '#uppyDashboard',
    inline: true
  })
  .use(Url, { target: Dashboard, serverUrl: isEdge ? 'https://companion.uppy.io' : 'http://localhost:3030' })
  .use(Tus, { endpoint: 'https://master.tus.io/files/' })
