const _ = require('underscore')
const { handleDescription } = require('./description')

const handleReqBodyType = (body, header) => {
  if (_.isEmpty(body)) {
    return 'raw'
  }

  if (body.mode === 'urlencoded') {
    return 'form'
  } else if (isContentTypeJson(header)) {
    return 'json'
  } else {
    return 'raw'
  }
}

/**
 * formData 处理
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
      desc: handleDescription(bodyForm[i].description)
    })
  }

  return res
}

const isContentTypeJson = (header) => {
  if (_.isString(header)) {
    return header.indexOf('application/json') > -1
  }

  if (_.isArray(header) && header.length) {
    return (
      header.filter((item) => item.key.toLowerCase() === 'content-type' && item.value === 'application/json').length !==
      0
    )
  }

  return false
}

module.exports = {
  handleReqBodyType,
  handleReq_body_form,
  isContentTypeJson
}
