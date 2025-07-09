import amqp from "amqplib";
import config from "../config/config";

class MessageService {
  public connection: amqp.ChannelModel;
  public channel: amqp.Channel;

  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      // Declare exchanges
      await this.channel.assertExchange(
        config.rabbitmq.exchanges.projects,
        "topic",
        { durable: true }
      );
      await this.channel.assertExchange(
        config.rabbitmq.exchanges.builds,
        "topic",
        { durable: true }
      );
      await this.channel.assertExchange(
        config.rabbitmq.exchanges.deployments,
        "topic",
        { durable: true }
      );

      // Declare queues
      await this.channel.assertQueue(config.rabbitmq.queues.projectEvents, {
        durable: true,
      });
      await this.channel.assertQueue(config.rabbitmq.queues.buildTrigger, {
        durable: true,
      });
      await this.channel.assertQueue(config.rabbitmq.queues.deployTrigger, {
        durable: true,
      });

      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
      throw error;
    }
  }

  async publishProjectEvent(eventType: string, projectId: string, data: any) {
    const message = {
      eventType,
      projectId,
      data,
      timestamp: new Date().toISOString(),
    };

    const routingKey = `project.${eventType}`;
    this.channel.publish(
      config.rabbitmq.exchanges.projects,
      routingKey,
      Buffer.from(JSON.stringify(message))
    );
  }

  async triggerBuild(projectId: string, buildConfig: any) {
    const message = {
      projectId,
      buildConfig,
      timestamp: new Date().toISOString(),
    };

    this.channel.sendToQueue(
      config.rabbitmq.queues.buildTrigger,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  }

  async triggerDeploy(projectId: string, deployConfig: any) {
    const message = {
      projectId,
      deployConfig,
      timestamp: new Date().toISOString(),
    };

    this.channel.sendToQueue(
      config.rabbitmq.queues.deployTrigger,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

export default new MessageService();
