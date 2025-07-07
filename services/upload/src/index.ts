import express, { ErrorRequestHandler, NextFunction } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import config from "./config/config";
import etcdService from "./services/etcdService";
import messageService from "./services/messageService";

// Routes
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Check etcd connection
    await etcdService.get("/health-check");

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        etcd: "connected",
        rabbitmq: messageService.channel ? "connected" : "disconnected",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

// Error handling middleware
const errorMiddleware: ErrorRequestHandler = (error, _req, res, next) => {
  // log err.stack
  console.error("Error:", error);

  if (error.name === "ValidationError") {
    res.status(400).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? {} : error.stack,
    });
  }

  if (error.name === "UnauthorizedError") {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      stack: process.env.NODE_ENV === "production" ? {} : error.stack,
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
    stack: process.env.NODE_ENV === "production" ? {} : error.stack,
  });
};

app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Setup etcd watchers for project state changes
async function setupWatchers() {
  try {
    // Watch for project changes
    await etcdService.watch(
      config.etcdKeys.projects,
      async (eventType, key, value) => {
        console.log(`Project ${eventType}:`, key);

        if (eventType === "put" && value) {
          // Publish project state change event
          await messageService.publishProjectEvent(
            "state_changed",
            value.projectId,
            value
          );
        }
      }
    );

    console.log("Etcd watchers setup successfully");
  } catch (error) {
    console.error("Error setting up watchers:", error);
  }
}

// Initialize services and start server
async function startHttpServer() {
  try {
    // Connect to RabbitMQ
    await messageService.connect();

    // Setup etcd watchers
    await setupWatchers();

    // Start server
    app.listen(Number(config.server.port), config.server.host, async () => {
      console.log(
        `Upload API Server running on http://${config.server.host}:${config.server.port}`
      );
      console.log("Services initialized successfully");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully");
  await messageService.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully");
  await messageService.close();
  process.exit(0);
});

startHttpServer();

export default app;

// import cors from "cors";
// import env from "dotenv";
// import express, {
//   ErrorRequestHandler,
//   NextFunction,
//   Request,
//   Response,
// } from "express";
// import UserService from "./services/userService";
// import WaitlistService from "./services/waitlistService.js";
// import { createError } from "./utils/createError.js";

// env.config();

// declare global {
//   namespace Express {
//     interface User {
//       sub: string;
//       email?: string;
//     }
//   }
// }

// const port = process.env.PORT || 9700;
// const app = express();
// const userService = new UserService();
// const waitlistService = new WaitlistService();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Healthcheck
// app.get("/health", async (req: Request, res: Response, next: NextFunction) => {
//   res
//     .status(200)
//     .json({ message: "Upload service is running!", data: { apiVersion: 1 } });
// });

// // Create users
// app.post("/users", async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { name, email } = req.body;
//     // const userCreated = await userService.createUser({ name, email });
//     res.status(201).json({ message: "user created", data: {} });
//   } catch (error) {
//     // logger
//     next(createError(500, "Error creating user"));
//   }
// });

// app.post(
//   "/waitlist",
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       console.log({ body: req.body });
//       const { email } = req.body;
//       console.log({ email });
//       const waitlistCreated = await waitlistService.createWaitlist({ email });
//       res
//         .status(201)
//         .json({ message: "Joined waitlist", data: { waitlistCreated } });
//     } catch (error) {
//       next(createError(500, "Error creating waitlist"));
//     }
//   }
// );

// // Error middleware
// const errorMiddleware: ErrorRequestHandler = (err, _req, res, next) => {
//   // log err.stack
//   const errorStatus = 500;
//   const errorMessage = "Something went wrong!";
//   res.status(errorStatus).json({
//     success: false,
//     data: {
//       message: errorMessage,
//     },
//     stack: process.env.NODE_ENV === "production" ? {} : err.stack,
//   });
// };

// app.use(errorMiddleware);

// app.listen(port, () => {
//   console.log(`Application server listening on port: http://localhost:${port}`);
// });
