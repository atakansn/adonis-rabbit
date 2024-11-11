import { Channel, ConsumeMessage } from 'amqplib'
import { MessageContract } from './types/index.js'
import NullMessageException from './exceptions/null_message_exception.js'

export default class Message<T> implements MessageContract {
  constructor(
    private $channel: Channel,
    private message: ConsumeMessage
  ) {
    if (message === null) {
      throw new NullMessageException('Message expected, received null.')
    }
  }

  /**
   * Acknowledge the message
   *
   * @param allUpTo Acknowledge all the messages up to this
   */
  ack(allUpTo = false) {
    this.$channel.ack(this.message, allUpTo)
  }

  /**
   * Rejects the message
   *
   * @param allUpTo Acknowledge all the messages up to this
   * @param requeue Adds back to the queue
   */
  nack(allUpTo = false, requeue = true) {
    this.$channel.nack(this.message, allUpTo, requeue)
  }

  /**
   * Rejects the message. Equivalent to nack, but worker in older
   * versions of RabbitMQ, where nack does not
   *
   * @param requeue Adds back to the queue
   */
  reject(requeue = true) {
    this.$channel.reject(this.message, requeue)
  }

  /**
   * The message content
   */
  get content() {
    return this.message.content.toString()
  }

  /**
   * The parsed message as JSON object
   */
  get jsonContent() {
    return JSON.parse(this.content) as T
  }

  /**
   * The message fields
   */
  get fields() {
    return this.message.fields
  }

  /**
   * The message properties
   */
  get properties() {
    return this.message.properties
  }
}
