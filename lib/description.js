const _ = require('underscore')

const handleDescription = (description) => {
  if (!description) {
    return ''
  }

  return _.isObject(description) ? description.content : description
}

module.exports = {
  handleDescription
}
