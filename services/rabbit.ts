import app from '@adonisjs/core/services/app'
import type { RabbitManagerContract } from '../src/types/index.js'

let rabbit: RabbitManagerContract

await app.booted(async () => {
  rabbit = await app.container.make('rabbit')
})

export { rabbit as default }
