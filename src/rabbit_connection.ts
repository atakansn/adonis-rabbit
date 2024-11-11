import { connect, Connection } from 'amqplib'
import { RabbitConfig } from './types/index.js'
import InvalidRabbitConfigException from './exceptions/invalid_rabbit_config_exception.js'

export default class RabbitConnection {
  /**
   * Whether the connection has already been established
   */
  hasConnection: boolean = false

  /**
   * The connection
   */
  private $connection: Connection | undefined
  private $connectionPromise: Promise<Connection> | undefined

  /**
   * The credentials
   */
  private readonly $credentials: string

  /**
   * The hostname
   */
  private readonly $hostname: string

  /**
   * The protocol
   */
  private readonly $protocol: string

  constructor(private readonly rabbitConfig: RabbitConfig) {
    this.$credentials = this.handleCredentials(this.rabbitConfig.user, this.rabbitConfig.password)

    this.$hostname = this.handleHostname(this.rabbitConfig.hostname, this.rabbitConfig.port)

    this.$hostname = this.handleHostname(this.rabbitConfig.hostname, this.rabbitConfig.port)

    this.$protocol = this.handleProtocol(this.rabbitConfig.protocol)
  }

  /**
   * Returns the credentials
   *
   * @param user The username
   * @param password The password
   */
  private handleCredentials(user: RabbitConfig['user'], password: RabbitConfig['password']) {
    if (!user) {
      throw new InvalidRabbitConfigException('Missing RabbitMQ user')
    }

    if (!password) {
      throw new InvalidRabbitConfigException('Missing RabbitMQ password')
    }

    return `${user}:${password}@`
  }

  /**
   * Returns the hostname
   *
   * @param hostname The hostname
   * @param port The port
   */
  private handleHostname(hostname: RabbitConfig['hostname'], port?: RabbitConfig['port']) {
    if (!hostname) {
      throw new InvalidRabbitConfigException('Missing RabbitMQ hostname')
    }

    return port ? `${hostname}:${port}` : hostname
  }

  /**
   * Custom protocol
   *
   * @param protocol
   */
  private handleProtocol(protocol: RabbitConfig['protocol']) {
    if (!protocol) {
      protocol = 'amqp://'
    }

    return `${protocol}://`
  }

  /**
   * Returns the connection URL
   */
  get url() {
    return [this.$protocol, this.$credentials, this.$hostname].join('')
  }

  /**
   * Returns the connection
   */
  async getConnection() {
    if (!this.$connection) {
      if (!this.$connectionPromise) {
        this.$connectionPromise = connect(this.url) as unknown as Promise<Connection>
      }
      this.$connection = await this.$connectionPromise
    }

    return this.$connection
  }

  /**
   * Closes the connection
   */
  async closeConnection() {
    if (this.hasConnection) {
      await this.$connection!.close()
      this.hasConnection = false
    }
  }
}
