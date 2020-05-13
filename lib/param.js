const { handleDescription } = require('./description')

const handleReqParams = (path) => {
  if (path && path.indexOf('/:') > -1) {
    let params = path.substr(path.indexOf('/:') + 2).split('/:')
    let arr = []
    for (let i in params) {
      arr.push({
        name: params[i],
        desc: ''
      })
    }
    return arr
  }

  return []
}

/**
 * 重组请求参数
 */
const handleReq_query = (query) => {
  let res = []
  if (query && query.length) {
    for (let i in query) {
      res.push({
        name: query[i].key,
        value: query[i].value,
        required: query[i].disabled ? '0' : '1',
        desc: handleDescription(query[i].description)
      })
    }
  }
  return res
}

module.exports = {
  handleReqParams,
  handleReq_query
}
