import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import config from "../config/config";
import etcdService from "../services/etcdService";
import { authenticateToken, authorize } from "../middleware/authMiddleware";

const router = express.Router();

// Register new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, role = "user" } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    // Check if user already exists
    const existingUsers = await etcdService.list(config.etcdKeys.users);
    const userExists = Object.values(existingUsers).find(
      // @ts-ignore
      (user) => user.email === email
    );

    if (userExists) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.auth.bcryptRounds
    );

    // Create user
    const userId = uuidv4();
    const user = {
      userId,
      email,
      password: hashedPassword,
      role,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await etcdService.put(`${config.etcdKeys.users}/${userId}`, user);

    // Generate JWT
    // @ts-ignore
    const token = jwt.sign({ userId, email, role }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        userId,
        email,
        role,
        active: user.active,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
    return;
  }
});

// Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    // Find user
    const users = await etcdService.list(config.etcdKeys.users);
    // @ts-ignore
    const user = Object.values(users).find((u) => u.email === email);

    // @ts-ignore
    if (!user || !user.active) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check password
    // @ts-ignore
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate JWT
    // @ts-ignore
    const token = jwt.sign(
      // @ts-ignore
      { userId: user.userId, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({
      message: "Login successful",
      token,
      user: {
        // @ts-ignore
        userId: user.userId,
        // @ts-ignore
        email: user.email,
        // @ts-ignore
        role: user.role,
        // @ts-ignore
        active: user.active,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get user profile
router.get(
  "/profile",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await etcdService.get(
        // @ts-ignore
        `${config.etcdKeys.users}/${req.user.userId}`
      );

      if (!user) {
        res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        userId: user.userId,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  }
);

// List users (admin only)
router.get(
  "/users",
  authenticateToken,
  // @ts-ignore
  authorize("users:read"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await etcdService.list(config.etcdKeys.users);

      const usersList = Object.values(users).map((user) => ({
        // @ts-ignore
        userId: user.userId,
        // @ts-ignore
        email: user.email,
        // @ts-ignore
        role: user.role,
        // @ts-ignore
        active: user.active,
        // @ts-ignore
        createdAt: user.createdAt,
      }));

      res.status(200).json(usersList);
    } catch (error) {
      console.error("Users list error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// Update user (admin only)
router.put(
  "/users/:userId",
  authenticateToken,
  // @ts-ignore
  authorize("users:update"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { role, active } = req.body;

      const user = await etcdService.get(`${config.etcdKeys.users}/${userId}`);
      if (!user) {
        res.status(404).json({ error: "User not found" });
      }

      // Update user
      const updatedUser = {
        ...user,
        ...(role && { role }),
        ...(active !== undefined && { active }),
        updatedAt: new Date().toISOString(),
      };

      await etcdService.put(`${config.etcdKeys.users}/${userId}`, updatedUser);

      res.json({
        message: "User updated successfully",
        user: {
          userId: updatedUser.userId,
          email: updatedUser.email,
          role: updatedUser.role,
          active: updatedUser.active,
        },
      });
    } catch (error) {
      console.error("User update error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  }
);

export default router;
