import test from 'node:test'
import assert from 'node:assert/strict'
import server from './index.mjs'

test('server listens on port 3000', (t, done) => {
  server.listen(3000, () => {
    assert.ok('server is listening')
    server.close()
    done()
  })
})

test('server responds with html client', (t, done) => {
  server.listen(3000, () => {
    fetch('http://localhost:3000').then(res => {
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('content-type'), 'text/html')
      server.close()
      done()
    })
  })
})