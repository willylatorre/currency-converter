import ky from 'ky'

const call = function call(method, path, params, data) {
  const url = path

  const config = {
    url,
    method,
    params,
    data: data ? JSON.stringify(data) : {}
  }

  return ky(config.url, {
    method: config.method,
    searchParams: params
  }).json()
}

const get = function get(path, pathParams, body) {
  return call('GET', path, pathParams, body)
}

export default {
  get
}
