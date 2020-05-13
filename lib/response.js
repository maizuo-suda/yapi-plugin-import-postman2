const GenerateSchema = require('generate-schema/src/schemas/json.js')
import { json_parse } from 'common/utils.js'

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

module.exports = {
  handleResponses
}
