import fetch from './fetch'
const host = 'https://api.exchangeratesapi.io'

export default {
  latest: params => fetch.get(host + '/latest', params)
}
