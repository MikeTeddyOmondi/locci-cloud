import express, { Request, Response } from "express";
// import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import config from "../config/config";
import etcdService from "../services/etcdService";
import messageService from "../services/messageService";
import {
  authenticateToken,
  authorize,
  checkProjectOwnership,
} from "../middleware/authMiddleware";

const router = express.Router();

// Create new project
router.post(
  "/",
  authenticateToken,
  // @ts-ignore
  authorize("projects:create"),
  //   upload.single("projectFile"),
  async (req: Request, res: Response) => {
    try {
      const { name, description, repositoryUrl, buildConfig, deployConfig } =
        req.body;
      const projectId = uuidv4();

      if (!name) {
        res.status(400).json({ error: "Project name required" });
        return;
      }

      const project = {
        projectId,
        name,
        description,
        repositoryUrl,
        // @ts-ignore
        ownerId: req.user.userId,
        buildConfig: buildConfig ? buildConfig : {},
        deployConfig: deployConfig ? deployConfig : {},
        // @ts-ignore
        filePath: req.file ? req.file.path : null,
        status: "created",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await etcdService.put(
        `${config.etcdKeys.projects}/${projectId}`,
        project
      );

      // Publish project creation event
      await messageService.publishProjectEvent("created", projectId, project);
      res.status(201).json({
        message: "Project created successfully",
        project: {
          projectId: project.projectId,
          name: project.name,
          description: project.description,
          status: project.status,
          createdAt: project.createdAt,
        },
      });
    } catch (error) {
      console.error("Project creation error:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  }
);

// List projects
router.get(
  "/",
  authenticateToken,
  // @ts-ignore
  authorize("projects:read"),
  async (req, res) => {
    try {
      const projects = await etcdService.list(config.etcdKeys.projects);

      // Filter projects based on user role
      let userProjects = Object.values(projects);
      // @ts-ignore
      if (req.user.role !== "admin") {
        userProjects = userProjects.filter(
          // @ts-ignore
          (project) => project.ownerId === req.user.userId
        );
      }

      const projectsList = userProjects.map((project) => ({
        // @ts-ignore
        projectId: project.projectId,
        // @ts-ignore
        name: project.name,
        // @ts-ignore
        description: project.description,
        // @ts-ignore
        status: project.status,
        // @ts-ignore
        ownerId: project.ownerId,
        // @ts-ignore
        createdAt: project.createdAt,
        // @ts-ignore
        updatedAt: project.updatedAt,
      }));

      res.json(projectsList);
    } catch (error) {
      console.error("Projects list error:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  }
);

// Get project details
router.get(
  "/:projectId",
  authenticateToken,
  // @ts-ignore
  authorize("projects:read"),
  checkProjectOwnership,
  async (req, res) => {
    try {
      // @ts-ignore
      const project = req.project;

      res.json({
        projectId: project.projectId,
        name: project.name,
        description: project.description,
        repositoryUrl: project.repositoryUrl,
        buildConfig: project.buildConfig,
        deployConfig: project.deployConfig,
        status: project.status,
        ownerId: project.ownerId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    } catch (error) {
      console.error("Project fetch error:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  }
);

// Update project
router.put(
  "/:projectId",
  authenticateToken,
  // @ts-ignore
  authorize("projects:update"),
  checkProjectOwnership,
  async (req, res) => {
    try {
      const { name, description, repositoryUrl, buildConfig, deployConfig } =
        req.body;
      // @ts-ignore
      const project = req.project;

      const updatedProject = {
        ...project,
        ...(name && { name }),
        ...(description && { description }),
        ...(repositoryUrl && { repositoryUrl }),
        ...(buildConfig && { buildConfig }),
        ...(deployConfig && { deployConfig }),
        updatedAt: new Date().toISOString(),
      };

      await etcdService.put(
        `${config.etcdKeys.projects}/${project.projectId}`,
        updatedProject
      );

      // Publish project update event
      await messageService.publishProjectEvent(
        "updated",
        project.projectId,
        updatedProject
      );

      res.json({
        message: "Project updated successfully",
        project: {
          projectId: updatedProject.projectId,
          name: updatedProject.name,
          description: updatedProject.description,
          status: updatedProject.status,
          updatedAt: updatedProject.updatedAt,
        },
      });
    } catch (error) {
      console.error("Project update error:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  }
);

// Delete project
router.delete(
  "/:projectId",
  authenticateToken,
  // @ts-ignore
  authorize("projects:delete"),
  checkProjectOwnership,
  async (req, res) => {
    try {
      // @ts-ignore
      const project = req.project;

      await etcdService.delete(
        `${config.etcdKeys.projects}/${project.projectId}`
      );

      // Publish project deletion event
      await messageService.publishProjectEvent(
        "deleted",
        project.projectId,
        project
      );

      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Project deletion error:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  }
);

// Build project
router.post(
  "/:projectId/build",
  authenticateToken,
  // @ts-ignore
  authorize("projects:build"),
  checkProjectOwnership,
  async (req, res) => {
    try {
      // @ts-ignore
      const project = req.project;
      const { buildOptions } = req.body;

      const buildConfig = {
        ...project.buildConfig,
        ...buildOptions,
        projectId: project.projectId,
        // @ts-ignore
        triggeredBy: req.user.userId,
        triggeredAt: new Date().toISOString(),
      };

      // Trigger build via RabbitMQ
      await messageService.triggerBuild(project.projectId, buildConfig);

      // Update project status
      const updatedProject = {
        ...project,
        status: "building",
        updatedAt: new Date().toISOString(),
      };

      await etcdService.put(
        `${config.etcdKeys.projects}/${project.projectId}`,
        updatedProject
      );

      res.json({
        message: "Build triggered successfully",
        buildConfig,
      });
    } catch (error) {
      console.error("Build trigger error:", error);
      res.status(500).json({ error: "Failed to trigger build" });
    }
  }
);

// Deploy project
router.post(
  "/:projectId/deploy",
  authenticateToken,
  // @ts-ignore
  authorize("projects:deploy"),
  checkProjectOwnership,
  async (req, res) => {
    try {
      // @ts-ignore
      const project = req.project;
      const { deployOptions } = req.body;

      const deployConfig = {
        ...project.deployConfig,
        ...deployOptions,
        projectId: project.projectId,
        // @ts-ignore
        triggeredBy: req.user.userId,
        triggeredAt: new Date().toISOString(),
      };

      // Trigger deployment via RabbitMQ
      await messageService.triggerDeploy(project.projectId, deployConfig);

      // Update project status
      const updatedProject = {
        ...project,
        status: "deploying",
        updatedAt: new Date().toISOString(),
      };

      await etcdService.put(
        `${config.etcdKeys.projects}/${project.projectId}`,
        updatedProject
      );

      res.json({
        message: "Deployment triggered successfully",
        deployConfig,
      });
    } catch (error) {
      console.error("Deploy trigger error:", error);
      res.status(500).json({ error: "Failed to trigger deployment" });
    }
  }
);

export default router;
