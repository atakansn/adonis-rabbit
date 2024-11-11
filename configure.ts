import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

export async function configure(_command: ConfigureCommand) {
  const codemods = await _command.createCodemods()

  try {
    await codemods.defineEnvValidations({
      leadingComment: 'RabbitMQ Environment Variables Validations',
      variables: {
        RABBITMQ_HOSTNAME: 'Env.schema.string()',
        RABBITMQ_PORT: 'Env.schema.number()',
        RABBITMQ_PROTOCOL: 'Env.schema.string.optional()',
        RABBITMQ_USER: 'Env.schema.string.optional()',
        RABBITMQ_PASSWORD: 'Env.schema.string.optional()',
      },
    })

    await codemods.defineEnvVariables({
      RABBITMQ_HOSTNAME: 'localhost',
      RABBITMQ_PORT: '5672',
      RABBITMQ_PROTOCOL: 'amqp',
      RABBITMQ_USER: 'guest',
      RABBITMQ_PASSWORD: 'guest',
    })

    await codemods.updateRcFile((rcFile) => {
      rcFile.addProvider('adonis-rabbit/providers/rabbit_provider')
    })

    await codemods.makeUsingStub(stubsRoot, 'rabbit.stub', {
      entity: _command.app.generators.createEntity('rabbit'),
    })
  } catch (error) {
    _command.logger.error('Unable to update adonisrc.ts file')
    _command.logger.error(error)
  }
}
