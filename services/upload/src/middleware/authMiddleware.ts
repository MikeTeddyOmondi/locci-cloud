import jwt from "jsonwebtoken";
import config from "../config/config";
import etcdService from "../services/etcdService";
import { NextFunction, Request, RequestHandler, Response } from "express";

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Verify user still exists and is active
    // @ts-ignore
    const userKey = `${config.etcdKeys.users}/${decoded.userId}`;
    const user = await etcdService.get(userKey);

    if (!user) {
      res.status(401).json({ error: "User not found" });
    }

    if (!user.active) {
      res.status(401).json({ error: "User account disabled" });
    }

    req.user = {
      // @ts-ignore
      userId: decoded.userId,
      // @ts-ignore
      email: decoded.email,
      // @ts-ignore
      role: decoded.role,
      permissions: user.permissions || [],
    };

    next();
  } catch (error) {
    console.error({ error });
    res.status(403).json({ error: "Invalid token" });
  }
};

const authorize = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // @ts-ignore
    const userRole = req.user.role;
    const allowedRoles = config.auth.permissions[permission];

    if (!allowedRoles || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: permission,
        userRole: userRole,
      });
    }

    next();
  };
};

const checkProjectOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID required" });
    }

    const projectKey = `${config.etcdKeys.projects}/${projectId}`;
    const projectData = await etcdService.get(projectKey);

    if (!projectData) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = JSON.parse(projectData);

    // Admin can access all projects, users can only access their own
    // @ts-ignore
    if (req.user.role !== "admin" && project.ownerId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied to this project" });
    }
    
    // @ts-ignore
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ error: "Error checking project ownership" });
  }
};

export { authenticateToken, authorize, checkProjectOwnership };
