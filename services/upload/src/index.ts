import cors from "cors";
import env from "dotenv";
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import UserService from "./services/userService";
import WaitlistService from "./services/waitlistService.js";
import { createError } from "./utils/createError.js";

env.config();

declare global {
  namespace Express {
    interface User {
      sub: string;
      email?: string;
    }
  }
}

const port = process.env.PORT || 9700;
const app = express();
const userService = new UserService();
const waitlistService = new WaitlistService();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get("/health", async (req: Request, res: Response, next: NextFunction) => {
  res
    .status(200)
    .json({ message: "Upload service is running!", data: { apiVersion: 1 } });
});

// Create users
app.post("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    // const userCreated = await userService.createUser({ name, email });
    res.status(201).json({ message: "user created", data: {} });
  } catch (error) {
    // logger
    next(createError(500, "Error creating user"));
  }
});

app.post(
  "/waitlist",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log({ body: req.body });
      const { email } = req.body;
      console.log({ email });
      const waitlistCreated = await waitlistService.createWaitlist({ email });
      res
        .status(201)
        .json({ message: "Joined waitlist", data: { waitlistCreated } });
    } catch (error) {
      next(createError(500, "Error creating waitlist"));
    }
  }
);

// Error middleware
const errorMiddleware: ErrorRequestHandler = (err, _req, res, next) => {
  // log err.stack
  const errorStatus = 500;
  const errorMessage = "Something went wrong!";
  res.status(errorStatus).json({
    success: false,
    data: {
      message: errorMessage,
    },
    stack: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
};

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Application server listening on port: http://localhost:${port}`);
});
