const _ = require('underscore')
const { queryString } = require('./base')
const { handleDescription } = require('./description')

/**
 * 从 header 中解析某个参数
 */
const queryHeaderParam = (header, key) => {
  if (_.isString(header)) {
    return queryString(header, key)
  }

  let paramValue = null
  if (_.isArray(header) && header.length) {
    header.forEach((item) => {
      if (item.key.toLowerCase() === key) {
        paramValue = item.value
      }
    })
  }

  return paramValue
}

/**
 * 重组 header
 */
const handleReq_headers = (headers) => {
  let res = []
  if (headers && headers.length) {
    for (let i in headers) {
      res.push({
        name: headers[i].key,
        value: headers[i].value,
        required: headers[i].disabled ? '0' : '1',
        desc: handleDescription(headers[i].description)
      })
    }
  }
  return res
}

module.exports = {
  queryHeaderParam,
  handleReq_headers
}
