const { Browser, impersonate } = require('../dist')

async function main() {
  const curly = impersonate(Browser.Chrome)
  const { data } = await curly.get('https://tls.browserleaks.com/json')
  console.log(`node-libcurl-ja3(chrome) response:`, data)
}

void main()
