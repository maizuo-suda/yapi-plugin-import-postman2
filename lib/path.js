const _ = require('underscore')
import URL from 'url'
const { queryHeaderParam } = require('./header')

const handleRequestUrl = (url, header) => {
  const path = _.isString(url) ? handlePath(url) : handlePath(url.raw)
  const xHost = queryHeaderParam(header, 'x-host')

  if (xHost) {
    return `${path}?x-host=${xHost}`
  }

  return path
}

const parseUrl = (url) => {
  return URL.parse(url)
}

const handlePath = (url) => {
  let path = parseUrl(url).pathname
  path = decodeURIComponent(path)
  if (!path) return ''

  path = path.replace(/\{\{.*\}\}/g, '')

  if (path[0] != '/') {
    path = '/' + path
  }

  return path
}

module.exports = {
  handleRequestUrl
}
