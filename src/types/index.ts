import { Channel, Connection, MessageFields, MessageProperties, Options, Replies } from 'amqplib'

/**
 * Interface representing the contract for a RabbitMQ manager.
 */
export interface RabbitManagerContract {
  /**
   * Indicates if the channel has been established.
   * @type {boolean}
   */
  hasChannel: boolean

  /**
   * Returns the current connection to RabbitMQ.
   * @returns {Promise<Connection>} A promise that resolves to the connection object.
   */
  getConnection(): Promise<Connection>

  /**
   * Returns the current channel for communication.
   * @returns {Promise<Channel>} A promise that resolves to the channel object.
   */
  getChannel(): Promise<Channel>

  /**
   * Ensures the existence of a queue, creating it if necessary.
   * @param {string} queueName - The name of the queue.
   * @param {Options.AssertQueue} [options] - Options for asserting the queue.
   * @returns {Promise<Replies.AssertQueue>} A promise that resolves to the assertion result.
   */
  assertQueue(queueName: string, options?: Options.AssertQueue): Promise<Replies.AssertQueue>

  /**
   * Sends a message to a specified queue.
   * @param {string} queueName - The name of the queue.
   * @param {any} content - The content of the message.
   * @param {Options.Publish} [options] - Options for publishing the message.
   * @returns {Promise<boolean>} A promise that resolves to true if the message is sent successfully.
   */
  sendToQueue(queueName: string, content: any, options?: Options.Publish): Promise<boolean>

  /**
   * Ensures the existence of an exchange, creating it if necessary.
   * @param {string} exchangeName - The name of the exchange.
   * @param {string} type - The type of the exchange (e.g., 'direct', 'topic').
   * @param {Options.AssertExchange} [options] - Options for asserting the exchange.
   * @returns {Promise<Replies.AssertExchange>} A promise that resolves to the assertion result.
   */
  assertExchange(
    exchangeName: string,
    type: string,
    options?: Options.AssertExchange
  ): Promise<Replies.AssertExchange>

  /**
   * Binds a queue to an exchange with an optional routing pattern.
   * @param {string} queueName - The name of the queue.
   * @param {string} exchangeName - The name of the exchange.
   * @param {string} [pattern] - The routing pattern.
   * @returns {Promise<Replies.Empty>} A promise that resolves when the binding is successful.
   */
  bindQueue(queueName: string, exchangeName: string, pattern?: string): Promise<Replies.Empty>

  /**
   * Sends a message to an exchange.
   * @param {string} exchangeName - The name of the exchange.
   * @param {string} routingKey - The routing key for the message.
   * @param {any} content - The content of the message.
   * @returns {Promise<boolean>} A promise that resolves to true if the message is sent successfully.
   */
  sendToExchange(exchangeName: string, routingKey: string, content: any): Promise<boolean>

  /**
   * Acknowledges all messages up to the current one.
   * @returns {Promise<void>} A promise that resolves when all messages are acknowledged.
   */
  ackAll(): Promise<void>

  /**
   * Rejects all messages up to the current one.
   * @param {boolean} [requeue=false] - Whether to requeue the rejected messages.
   * @returns {void | Promise<void>} Returns void or a promise that resolves when messages are rejected.
   */
  nackAll(requeue?: boolean): void | Promise<void>

  /**
   * Consumes messages from a specified queue.
   * @param {string} queueName - The name of the queue.
   * @param {(msg: MessageContract<T>) => void | Promise<void>} onMessage - The message handler.
   * @returns {Promise<Replies.Consume>} A promise that resolves to the consumption result.
   * @template T
   */
  consumeFrom<T extends object = any>(
    queueName: string,
    onMessage: (msg: MessageContract<T>) => void | Promise<void>
  ): Promise<Replies.Consume>

  /**
   * Closes the current channel.
   * @returns {Promise<void>} A promise that resolves when the channel is closed.
   */
  closeChannel(): Promise<void>

  /**
   * Closes the current connection.
   * @returns {Promise<void>} A promise that resolves when the connection is closed.
   */
  closeConnection(): Promise<void>
}

/**
 * Interface representing a message contract for RabbitMQ.
 * @template T
 */
export interface MessageContract<T extends object = any> {
  /**
   * Acknowledges the message.
   * @param {boolean} [allUpTo=false] - Whether to acknowledge all messages up to this one.
   * @returns {void}
   */
  ack(allUpTo?: boolean): void

  /**
   * Rejects the message.
   * @param {boolean} [allUpTo=false] - Whether to reject all messages up to this one.
   * @param {boolean} [requeue=false] - Whether to requeue the message.
   * @returns {void}
   */
  nack(allUpTo?: boolean, requeue?: boolean): void

  /**
   * Rejects the message (alias for nack, supports older RabbitMQ versions).
   * @param {boolean} [requeue=false] - Whether to requeue the message.
   * @returns {void}
   */
  reject(requeue?: boolean): void

  /**
   * The message content as a string.
   * @type {string}
   */
  content: string

  /**
   * The parsed JSON content of the message.
   * @type <T>
   */
  jsonContent: T

  /**
   * The fields of the message.
   * @type {MessageFields}
   */
  fields: MessageFields

  /**
   * The properties of the message.
   * @type {MessageProperties}
   */
  properties: MessageProperties
}

/**
 * Configuration options for RabbitMQ.
 */
export interface RabbitConfig {
  /**
   * The RabbitMQ username.
   * @example 'admin'
   * @type {string}
   */
  user?: string

  /**
   * The RabbitMQ password.
   * @example 'supersecretpassword1234'
   * @type {string}
   */
  password?: string

  /**
   * The RabbitMQ hostname.
   * @example 'localhost'
   * @type {string}
   */
  hostname: string

  /**
   * The RabbitMQ port.
   * @type {number}
   */
  port?: number

  /**
   * The RabbitMQ protocol.
   * @default 'amqp'
   * @type {string}
   */
  protocol?: string
}
