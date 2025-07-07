import dotenv from "dotenv";

dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 8989,
    host: process.env.HOST || "localhost",
  },
  etcd: {
    hosts: process.env.ETCD_HOSTS || "http://localhost:2379",
    auth: {
      username: process.env.ETCD_USERNAME,
      password: process.env.ETCD_PASSWORD,
    },
    options: {
      // Add any additional etcd options
    },
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
    exchanges: {
      projects: "projects.events",
      builds: "builds.events",
      deployments: "deployments.events",
    },
    queues: {
      projectEvents: "project.events",
      buildTrigger: "build.trigger",
      deployTrigger: "deploy.trigger",
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  auth: {
    bcryptRounds: 12,
    roles: {
      ADMIN: "admin",
      USER: "user",
    },
    permissions: {
      // Project permissions
      "projects:create": ["admin", "user"],
      "projects:read": ["admin", "user"],
      "projects:update": ["admin", "user"],
      "projects:delete": ["admin"],
      "projects:build": ["admin", "user"],
      "projects:deploy": ["admin", "user"],

      // User management (admin only)
      "users:create": ["admin"],
      "users:read": ["admin"],
      "users:update": ["admin"],
      "users:delete": ["admin"],

      // System operations
      "system:monitor": ["admin"],
      "system:config": ["admin"],
    },
  },
  etcdKeys: {
    users: "/app/users",
    projects: "/app/projects",
    builds: "/app/builds",
    deployments: "/app/deployments",
    config: "/app/config",
  },
};

export default config;
