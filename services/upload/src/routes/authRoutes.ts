import passport from "passport";
import { NextFunction, Response, Request, Router } from "express";
import { AuthService } from "../services/authService.js";
import UserRepository from "../repositories/userRepository.js";
import { oauthProviders } from "../config/oauthConfig.js";

const router = Router();
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const token = await authService.register(email, password);
      res.json({ token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const token = await authService.login(email, password);
      res.json({ token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get(
  "/oauth/:provider",
  (req: Request, res: Response, next: NextFunction) => {
    const { provider } = req.params;
    if (!oauthProviders[provider]) {
      return res.status(400).json({ message: "Unsupported OAuth provider" });
    }

    let state =
      typeof req.query.state === "string" ? req.query.state : undefined;
    return passport.authenticate(provider as string, { session: false, state })(
      req,
      res,
      next
    );
  }
);

router.post(
  "/oauth/exchange/:provider",
  (req: Request, res: Response, next: NextFunction) => {
    const { provider } = req.params;

    if (!oauthProviders[provider]) {
      return res.status(400).json({ message: "Unsupported OAuth provider" });
    }

    passport.authenticate(
      provider as string,
      { session: false },
      async (err: any, user: any) => {
        if (err || !user) {
          return res
            .status(400)
            .json({ message: "OAuth authentication failed" });
        }
        try {
          const token = authService.generateTokenForUser(user);
          res.json({ token });
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      }
    )(req, res, next);
  }
);

export default router;
