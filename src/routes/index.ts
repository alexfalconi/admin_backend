import { Router } from "express";
import dynamicRoutes from "../routes/dynamicRoutes.ts";
import uploadRoutes from "../routes/uploadRoutes.ts";
import loginRoutes from "../routes/loginRoutes.ts";
import userRoutes from "../routes/userRoutes.ts";

const router = Router();

router.use(dynamicRoutes);
router.use(uploadRoutes);
router.use(loginRoutes);
router.use(userRoutes);

export default router;
