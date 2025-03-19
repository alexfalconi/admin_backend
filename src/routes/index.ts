import { Router } from "express";
import dynamicRoutes from "@routes/dynamicRoutes";
import uploadRoutes from "@routes/uploadRoutes";
import loginRoutes from "@routes/loginRoutes";
import userRoutes from "@routes/userRoutes";

const router = Router();

router.use(dynamicRoutes);
router.use(uploadRoutes);
router.use(loginRoutes);
router.use(userRoutes);

export default router;
