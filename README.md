# Locci Cloud (Platform as a Service)

> 🔥 **Serving modern web apps on local infrastructure**

## Overview

The Locci Cloud is a comprehensive Platform-as-a-Service (PaaS) solution designed to serve modern web applications using local infrastructure. This platform provides enterprise-grade deployment capabilities with cloud-native features while maintaining full control over your infrastructure.

## Architecture

The platform consists of several key components working together to provide a seamless deployment and hosting experience:

### Core Components

#### 1. **Load Balancer Layer**

- Distributes incoming traffic across multiple service instances
- Provides high availability and fault tolerance
- Supports multiple applications (Website, API, Admin, Forums, Support, Status)

#### 2. **Deployment Pipeline**

- **Git Integration**: Webhook-triggered deployments from Git repositories
- **REST API**: Exposed endpoints for programmatic deployment management
- **Automated Processing**: Handles build, test, and deployment workflows

#### 3. **Service Layer**

```
┌─ Uploading Service ──┐    ┌─ Bundler Service ───┐    ┌─ Deploying Service ──┐
│ • Project uploads    │    │ • Asset bundling    │    │ • Container mgmt     │
│ • CDN integrations   │    │ • Image optimization│    │ • Service discovery  │
│ • Asset management   │    │ • Build processes   │    │ • Health monitoring  │
└──────────────────────┘    └─────────────────────┘    └──────────────────────┘
```

#### 4. **Storage & CDN**

- **Local Database**: Persistent storage for application data
- **CDN Integration**: Content delivery network for static assets
- **File Management**: Automated upload and distribution

#### 5. **Edge Cloud Network**

- **Kubernetes-Powered**: Container orchestration at the edge
- **Distributed Processing**: Multi-node deployment capabilities
- **Network Optimization**: Reduced latency through edge computing

#### 6. **Container Registry**

- **OCI Compliant**: Standard container image management
- **DockerHub Integration**: Seamless image pulling and pushing
- **Version Control**: Tagged releases and rollback capabilities

## Key Features

### 🚀 **Automated Deployment**

- Git webhook integration for continuous deployment
- RESTful API for programmatic deployments
- Support for multiple deployment strategies
- Automated rollback capabilities

### 📦 **Container Management**

- OCI-compliant container registry
- Automated image building and optimization
- Multi-architecture support
- Health monitoring and auto-scaling

### 🌐 **Edge Computing**

- Kubernetes-powered edge network
- Geographic distribution of services
- Reduced latency through edge deployment
- Load balancing across edge nodes

### 🔧 **Service Integration**

- Microservices architecture
- Service discovery and communication
- Inter-service messaging and queuing
- API gateway functionality

### 📊 **Monitoring & Observability**

- Real-time service health monitoring
- Performance metrics and analytics
- Automated alerting and notifications
- Comprehensive logging system

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (local or remote)
- Git repository access
- Node.js 18+

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/MikeTeddyOmondi/locci-cloud
cd locci-cloud
```

2. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your specific configuration
```

3. **Start core services**

```bash
docker-compose up -d
```

4. **Deploy edge network**

```bash
kubectl apply -f k8s/
```

5. **Verify installation**

```bash
curl http://localhost/health
```

### Configuration

#### Environment Variables

```bash
# 🕐 TODO: Add .env variables
```

## Usage

### Deploying an Application

#### Via Git Webhook

1. Configure webhook in your Git repository
2. Push changes to trigger automated deployment
3. Monitor deployment status through the dashboard

#### Via REST API

```bash
# Deploy new application
curl -X POST http://localhost/api/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "https://github.com/user/app.git",
    "branch": "main",
    "environment": "production"
  }'

# Check deployment status
curl http://localhost/api/deployments/{deployment-id}
```

#### Via CLI Tool

```bash
# Install CLI
npm install -g @locci-cloud/cli

# Login
locci-cloud login

# Deploy application
locci-cloud deploy --repo https://github.com/user/app.git --env production
```

### Managing Services

#### List Running Services

```bash
locci-cloud services list
```

#### Scale Service

```bash
locci-cloud services scale webapp --replicas 3
```

#### View Logs

```bash
locci-cloud logs webapp --follow
```

## API Reference

### Deployment Endpoints

- `POST /api/deploy` - Create new deployment
- `GET /api/deployments` - List all deployments
- `GET /api/deployments/{id}` - Get deployment details
- `DELETE /api/deployments/{id}` - Remove deployment

### Service Management

- `GET /api/services` - List all services
- `POST /api/services/{name}/scale` - Scale service
- `GET /api/services/{name}/logs` - Get service logs
- `POST /api/services/{name}/restart` - Restart service

### Health & Monitoring

- `GET /health` - Platform health check
- `GET /api/metrics` - Platform metrics
- `GET /api/status` - Detailed status information

## Development

### Project Structure

```
locci-cloud/
├── services/
│   ├── upload/               # File upload and CDN management
│   ├── bundler/              # Asset bundling and optimization
│   ├── deploy/               # Container deployment management
│   └── proxy/                # Traffic distribution
├── k8s/                      # Kubernetes manifests
├── docker/                   # Docker manifests
├── packages/                 # Packages/Libraries
├── apps/                     # Apps
├── cli/                      # Command-line interface
└── docs/                     # Additional documentation & REST API Swagger implementation docs
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

## Troubleshooting

### Common Issues

#### Services Not Starting

- Check Docker daemon is running
- Verify port availability
- Review service logs: `docker-compose logs [service-name]`

#### Deployment Failures

- Verify Git repository access
- Check webhook configuration
- Review deployment logs in dashboard

#### Performance Issues

- Monitor resource usage: `locci-cloud metrics`
- Check edge node health
- Review load balancer configuration

### Support

- 📚 [Documentation](./docs/)
- 🐛 [Issue Tracker](./issues)
- 💬 [Community Discord](https://discord.gg/loccicloud)
- 📧 [Email Support](mailto:support@locci.cloud)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Kubernetes community for orchestration platform
- Docker for containerization technology
- CDN providers for global content delivery
- Open source contributors and maintainers

---

**Built with ❤️ for serving modern web applications**
