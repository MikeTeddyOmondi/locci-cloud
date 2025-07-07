# API Usage Examples

# 1. Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "role": "user"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'

# 3. Create a project (with JWT token)
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Web App",
    "description": "A sample web application",
    "repositoryUrl": "https://github.com/user/my-web-app.git",
    "buildConfig": {
      "dockerfile": "Dockerfile",
      "context": ".",
      "buildArgs": {
        "NODE_ENV": "production"
      }
    },
    "deployConfig": {
      "target": "kubernetes",
      "namespace": "default",
      "replicas": 3,
      "port": 3000
    }
  }'

# 4. Upload project files
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=My App" \
  -F "description=Sample app" \
  -F "projectFile=@/path/to/your/project.zip" \
  -F 'buildConfig={"dockerfile":"Dockerfile","context":"."}'

# 5. Trigger build
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/build \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "buildOptions": {
      "tag": "v1.0.0",
      "push": true
    }
  }'

# 6. Deploy project
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/deploy \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deployOptions": {
      "environment": "production",
      "replicas": 3
    }
  }'

# 7. List projects
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 8. Get project details
curl -X GET http://localhost:3000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 9. Health check
curl -X GET http://localhost:3000/health
