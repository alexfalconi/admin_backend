import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const prisma = new PrismaClient();
const router = Router();

router.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

router.post("/api/login", async (req: Request, res: Response) => {
	try {
		const { user, password } = req.body;

		if (!user || !password) {
			res.status(400).json({ message: "Usuário e senha são obrigatórios" });
			return;
		}

		// Busca por usuários com o nome de usuário fornecido
		const dbUsers = await prisma.users.findMany({
			where: { user: user, active: 1 },
		});

		// Verifica se algum usuário foi encontrado e se a senha corresponde
		if (!dbUsers || dbUsers.length === 0) {
			res.status(401).json({ message: "Erro ao fazer login. Verifique seus dados." });
			return;
		}

		let dbUser = null;
		for (const u of dbUsers) {
			if (password === u.password) {
				dbUser = u;
				break;
			}
		}

		if (!dbUser) {
			res.status(401).json({ message: "Erro ao fazer login. Verifique seus dados." });
			return;
		}

		const token = jwt.sign({ id: dbUser.id, user: dbUser.user }, JWT_SECRET, { expiresIn: "1d" });

		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 86400000,
		});

		res.json({
			message: "Login realizado com sucesso",
			user: dbUser.user,
		});
	} catch (error) {
		console.error("Erro ao realizar login:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	} finally {
		await prisma.$disconnect();
	}
});

router.post("/logout", (req: Request, res: Response) => {
	res.clearCookie("token", { path: "/" });
	res.status(200).json({ message: "Logout realizado com sucesso" });
});

export default router;
