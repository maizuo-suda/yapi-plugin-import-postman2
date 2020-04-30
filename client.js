import { message } from 'antd'
import URL from 'url'
import _ from 'underscore'
const GenerateSchema = require('generate-schema/src/schemas/json.js')
import { json_parse } from 'common/utils.js'

const parseUrl = (url) => {
  return URL.parse(url)
}

const checkInterRepeat = (requests) => {
  let obj = {}
  let arr = []

  for (let i in requests) {
    const item = requests[i]
    const { url, method } = item.request
    const requestUrl = url.row

    if (!obj[requestUrl + '-' + method + '-' + method]) {
      arr.push(item)
      obj[requestUrl + '-' + method + '-' + method] = true
    }
  }

  return arr
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
        desc: query[i].description,
        value: query[i].value,
        required: query[i].disabled ? '0' : '1'
      })
    }
  }
  return res
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
        desc: headers[i].description,
        value: headers[i].value,
        required: headers[i].disabled ? '0' : '1'
      })
    }
  }
  return res
}

/**
 * formData
 */
const handleReq_body_form = (body) => {
  let res = []

  if (_.isEmpty(body) || _.isEmpty(body.mode) || _.isEmpty(body[body.mode])) {
    return res
  }

  const bodyForm = body[body.mode]

  for (let i in bodyForm) {
    res.push({
      name: bodyForm[i].key,
      value: bodyForm[i].value,
      type: bodyForm[i].type,
      required: bodyForm[i].disabled ? '0' : '1',
      desc: bodyForm[i].description
    })
  }

  return res
}

const handlePath = (path) => {
  path = parseUrl(path).pathname
  path = decodeURIComponent(path)
  if (!path) return ''

  path = path.replace(/\{\{.*\}\}/g, '')

  if (path[0] != '/') {
    path = '/' + path
  }
  return path
}

/**
 * 将接口和分类分离
 */
const splitItemAndFolder = (items) => {
  let folders = []
  let requests = []

  items.forEach((child) => {
    if (child.hasOwnProperty('request')) {
      requests.push(child)
    } else {
      folders.push(child)
    }
  })

  return {
    folders,
    requests
  }
}

/**
 * keys：
 *      'title',
 *      'path',
 *      'catname',
 *      'method',
 *      'desc',
 *
 *      'req_query',
 *      'req_params',
 *      'req_headers',
 *      'req_body_type',
 *      'req_body_form',
 *      'req_body_other',
 *      'req_body_is_json_schema'
 *
 *      'res_body_type'
 *      'res_body_is_json_schema'
 *      'res_body'
 */
const importPostman = (data) => {
  try {
    const { name, request, response } = data
    /**
     * header：one of Header List | string
     */
    const { url, method, header, body, description } = request

    /**
     * mode：enum of {raw、urlencoded、formdata、file、graphql}
     */

    let res = {}

    res.title = name

    res.path = _.isString(url) ? handlePath(url) : handlePath(url.raw)

    res.catname = '' // TODO

    res.method = method

    res.desc = description

    res.req_query = _.isString(url) ? [] : handleReq_query(url.query)

    res.req_params = handleReqParams(res.path)

    res.req_headers = _.isString(header) ? [] : handleReq_headers(header)

    // TODO
    res.req_body_type = handleReqBodyType(body, header)

    res.req_body_form = handleReq_body_form(body)

    // TODO
    res.req_body_is_json_schema = _.isString(header) && header.indexOf('application/json') > -1

    // response
    res = Object.assign({}, res, handleResponses(response))

    return res
  } catch (err) {
    message.error(`${err.message}, 导入的postman格式有误`)
  }
}

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
    // url 后携带参数
    return arr
  }

  return []
}

const handleReqBodyType = (body, header) => {
  if (_.isEmpty(body)) {
    return 'raw'
  }

  if (body.mode === 'urlencoded') {
    return 'form'
  } else if (_.isString(header) && header.indexOf('application/json') > -1) {
    return 'json'
  } else {
    return 'raw'
  }
}

const handleResponses = (data) => {
  if (data && data.length) {
    let res = data[0]
    let response = {}
    response.res_body_type = res._postman_previewlanguage === 'json' ? 'json' : 'raw'
    if (res._postman_previewlanguage === 'json') {
      response.res_body_is_json_schema = true
      response.res_body = transformJsonToSchema(res.body)
    } else {
      response.res_body = res.body
    }
    return response
  }

  return {}
}

const transformJsonToSchema = (json) => {
  json = json || {}
  let jsonData = json_parse(json)

  jsonData = GenerateSchema(jsonData)

  let schemaData = JSON.stringify(jsonData)
  return schemaData
}

// var cacheFolders = []

function postman(importDataModule) {
  function run(res) {
    try {
      res = JSON.parse(res)
      let interfaceData = { apis: [], cats: [] }

      // 分类和接口列表
      let { folders, requests } = splitItemAndFolder(res.item)
      requests = checkInterRepeat(requests)

      // 分类 Category
      if (folders && Array.isArray(folders)) {
        folders.forEach((tag) => {
          interfaceData.cats.push({
            name: tag.name,
            desc: tag.description
          })
        })

        // cacheFolders = folders
      }

      // 转化数据
      if (requests && requests.length) {
        for (let key in requests) {
          let data = importPostman.bind(this)(requests[key])
          interfaceData.apis.push(data)
        }
      }

      return interfaceData
    } catch (e) {
      message.error('文件格式必须为JSON')
    }
  }

  if (!importDataModule || typeof importDataModule !== 'object') {
    console.error('obj参数必需是一个对象')
    return null
  }

  importDataModule.Postman2 = {
    name: 'Postman2',
    run: run,
    desc: '注意：只支持json格式数据'
  }
}

module.exports = function () {
  this.bindHook('import_data', postman)
}
