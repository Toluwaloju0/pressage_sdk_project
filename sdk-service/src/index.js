import { loadRootEnv, readConfig } from './config.js'
import { createSdkSessionFactory } from './sdkSession.js'
import { createScanServer } from './server.js'

loadRootEnv()
const config = readConfig()

// There is no server-wide Presage key. Each person enters their own on the Account page, and
// the browser sends it with every scan.
const { server } = createScanServer({
  config,
  createSession: createSdkSessionFactory({ telemetry: config.telemetry }),
})

server.listen(config.port, config.host, () => {
  console.log(`Scan service listening on http://${config.host}:${config.port}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
