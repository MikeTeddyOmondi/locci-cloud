# Default
default:
  just --list

# Build project
build:
  cargo build  
  
# Build release project
build-release:
  cargo build --release  
  
# Run project  
run-dev:
  cargo run

# Run release project  
run-release:
    cargo run --release

# Build Docker Image
build-image:
  docker build -t ranckosolutionsinc/bundler:v1.0.0 . 

# Run Docker Container
run-container:
  docker run -d -p 5900:5900 --network locci --restart always --name bundler ranckosolutionsinc/bundler:v1.0.0  

# Docker compose 
run-compose:
  docker compose up -d

# Docker compose down
run-compose-down:
  docker compose down