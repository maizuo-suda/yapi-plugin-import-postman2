import { message } from 'antd'
import _ from 'underscore'
import { handleReq_headers } from './lib/header'
import { handleDescription } from './lib/description'
import { handleRequestUrl } from './lib/path'
import { handleResponses } from './lib/response'
import { handleReqBodyType, handleReq_body_form, isContentTypeJson } from './lib/body'
import { handleReqParams, handleReq_query } from './lib/param'

/**
 * 筛选接口列表和分类列表
 */
const filterItemAndFolder = (items) => {
  let folders = []
  let requests = []

  items.forEach((item) => {
    if (item.hasOwnProperty('request')) {
      item.catname = null
      requests.push(item)
    } else {
      folders.push(item)

      // 二级分类中包含接口数据（目前只处理到二级分类，且二级分类会扁平处理为一级分类，yapi 只支持一级分类）
      const subItems = item.item
      if (subItems && subItems.length) {
        subItems.forEach((subItem) => {
          subItem.catname = item.name
          requests.push(subItem)
        })
      }
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
  console.log('data', data)
  try {
    const { name, request, response, catname } = data
    /**
     * header：one of Header List | string
     */
    const { url, method, header, body, description } = request

    /**
     * mode：enum of {raw、urlencoded、formdata、file、graphql}
     */

    let res = {}

    res.title = name

    res.path = handleRequestUrl(url, header)

    // 所属分类名
    res.catname = catname

    res.method = method

    res.desc = handleDescription(description)

    res.req_query = _.isString(url) ? [] : handleReq_query(url.query)

    res.req_params = handleReqParams(res.path)

    res.req_headers = _.isString(header) ? [] : handleReq_headers(header)

    res.req_body_type = handleReqBodyType(body, header)

    res.req_body_form = handleReq_body_form(body)

    res.req_body_is_json_schema = isContentTypeJson(header)

    // response
    res = Object.assign({}, res, handleResponses(response))

    return res
  } catch (err) {
    message.error(`${err.message}, 导入的postman格式有误`)
  }
}

function postman(importDataModule) {
  function run(res) {
    try {
      res = JSON.parse(res)
      let interfaceData = { apis: [], cats: [] }

      // 筛选接口和分类
      let { folders, requests } = filterItemAndFolder(res.item)

      // 分类数据
      if (folders && Array.isArray(folders)) {
        folders.forEach((tag) => {
          interfaceData.cats.push({
            name: tag.name,
            desc: tag.description
          })
        })
      }

      // 转换为需要的接口数据格式
      if (requests && requests.length) {
        for (let key in requests) {
          let data = importPostman(requests[key])
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
    desc: 'Postman数据导入（支持 v2.0+）'
  }
}

module.exports = function () {
  this.bindHook('import_data', postman)
}
