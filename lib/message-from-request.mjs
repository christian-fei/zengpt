export default async function (req) {
  return new Promise((resolve, reject) => {
    try {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', async () => {
        resolve(decodeURIComponent(body.split('=')[1]).trim())
      })
      req.on('error', reject)
    } catch (error) {
      reject(error)
    }
  })
}