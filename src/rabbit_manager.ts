import { Channel, ConsumeMessage, Options } from 'amqplib'
import { MessageContract, RabbitConfig, RabbitManagerContract } from './types/index.js'
import RabbitConnection from './rabbit_connection.js'
import Message from './message.js'
import { safeStringify } from './utils/index.js'

export default class RabbitManager implements RabbitManagerContract {
  /**
   * The connection manager
   */
  private readonly rabbitConnection: RabbitConnection

  /**
   * If the channel has been established
   */
  hasChannel: boolean = false

  /**
   * The channel
   */
  private $channelPromise: Promise<Channel> | undefined
  private $channel: Channel | undefined

  constructor(rabbitConfig: RabbitConfig) {
    this.rabbitConnection = new RabbitConnection(rabbitConfig)
  }

  /**
   * Converts the content to a Buffer
   *
   * @param content The content
   */
  private toBuffer(content: any) {
    return Buffer.isBuffer(content)
      ? content
      : Buffer.from(typeof content === 'object' ? safeStringify(content) : content)
  }

  /**
   * Returns the connection
   */
  async getConnection() {
    return this.rabbitConnection.getConnection()
  }

  /**
   * Returns the channel
   */
  async getChannel() {
    const connection = await this.rabbitConnection.getConnection()

    if (!this.hasChannel || !this.$channel) {
      if (!this.$channelPromise) {
        this.$channelPromise = connection.createChannel() as unknown as Promise<Channel>
      }
      this.$channel = await this.$channelPromise
      this.hasChannel = true
    }

    return this.$channel
  }

  /**
   * Creates a queue if doesn't exist
   *
   * @param queueName The name of the queue
   * @param options The options
   */
  async assertQueue(queueName: string, options?: Options.AssertQueue) {
    const channel = await this.getChannel()

    return channel.assertQueue(queueName, options)
  }

  /**
   * Sends the message to the queue
   *
   * @param queueName The name of the queue
   * @param content The content
   * @param options The options
   */
  async sendToQueue(queueName: string, content: any, options?: Options.Publish) {
    const channel = await this.getChannel()

    return channel.sendToQueue(queueName, this.toBuffer(content), options)
  }

  /**
   * Creates an Exchange if doesn't exist
   *
   * @param exchangeName The exchange name
   * @param type The exchange type
   * @param options The content
   */
  async assertExchange(exchangeName: string, type: string, options?: Options.AssertExchange) {
    const channel = await this.getChannel()

    return channel.assertExchange(exchangeName, type, options)
  }

  /**
   * Binds a queue and an exchange
   *
   * @param queueName The queue name
   * @param exchangeName The exchange name
   * @param pattern The pattern
   */
  async bindQueue(queueName: string, exchangeName: string, pattern = '') {
    const channel = await this.getChannel()

    return channel.bindQueue(queueName, exchangeName, pattern)
  }

  /**
   * Sends a message to an exchange
   *
   * @param exchangeName The exchange name
   * @param routingKey A routing key
   * @param content The content
   */
  async sendToExchange(exchangeName: string, routingKey: string, content: any) {
    const channel = await this.getChannel()

    return channel.publish(exchangeName, routingKey, this.toBuffer(content))
  }

  /**
   * Acknowledges all messages
   */
  async ackAll() {
    const channel = await this.getChannel()

    return channel.ackAll()
  }

  /**
   * Rejects all messages
   *
   * @param requeue Adds back to the queue
   */
  async nackAll(requeue: boolean) {
    const channel = await this.getChannel()

    return channel.nackAll(requeue)
  }

  /**
   * Consumes messages from a queue
   *
   * @param queueName The queue name
   * @param onMessage The listener
   */
  async consumeFrom<T extends object = any>(
    queueName: string,
    onMessage: (msg: MessageContract<T>) => void | Promise<void>
  ) {
    const channel = await this.getChannel()

    return channel.consume(queueName, (message) => {
      const messageInstance = new Message<T>(channel, message as ConsumeMessage)
      onMessage(messageInstance)
    })
  }

  /**
   * Closes the channel
   */
  async closeChannel() {
    if (this.hasChannel && this.$channel) {
      await this.$channel.close()
      this.hasChannel = false
    }
  }

  /**
   * Closes the connection
   */
  async closeConnection() {
    await this.rabbitConnection.closeConnection()
  }
}
