import { Router } from "express";
import { successResponse } from "../../common/utils/response/success.response.js";
import { getProfile } from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../middleware/auth.middleware.js";
import { endpoint } from "./user.authorization.js";

const router = Router();

//profile
router.get(
  "/profile",
  authentication(),
  authorization(endpoint.profile),
  async (req, res, next) => {
    const profile = await getProfile(req.user);
    return successResponse({ res, data: profile });
  },
);

export default router;
