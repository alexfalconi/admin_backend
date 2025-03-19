import { Router } from "express";
import { Request, Response } from "express";
import { authMiddleware } from "@middlewares/authMiddleware";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/api/me", authMiddleware, async (req: Request, res: Response) => {
	const { id } = (req as any).user;

	const userData = await prisma.users.findUnique({
		where: { id },
		select: {
			id: true,
			image: true,
			name: true,
			email: true,
			user: true,
			action_add: true,
			action_edit: true,
			action_delete: true,
			action_view: true,
		},
	});

	if (!userData) {
		res.status(404).json({ message: "Usuário não encontrado" });
		return;
	}

	res.json(userData);
});

export default router;
