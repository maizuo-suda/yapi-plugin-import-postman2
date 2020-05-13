const queryString = (content, key) => {
  const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i')
  let r = null
  if (content) {
    r = content.match(reg)
  }

  return r ? decodeURIComponent(r[2]) : null
}

module.exports = {
  queryString
}
