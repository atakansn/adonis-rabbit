import { RabbitConfig, RabbitManagerContract } from '../src/types/index.js'
import { ApplicationService } from '@adonisjs/core/types'
import RabbitManager from '../src/rabbit_manager.js'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    rabbit: RabbitManagerContract
  }
}

export default class RabbitProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('rabbit', async (resolver) => {
      const configProvider = await resolver.make('config')
      const rabbitConfig = configProvider.get<RabbitConfig>('rabbit')

      return new RabbitManager(rabbitConfig)
    })
  }

  async shutdown() {
    const rabbit = await this.app.container.make('rabbit')
    await rabbit.closeChannel()
    await rabbit.closeConnection()
  }
}
