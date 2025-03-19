import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const token = req.cookies.token;

	if (!token) {
		res.status(401).json({ message: "Não autorizado: token ausente" });
		return;
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		(req as any).user = decoded;
		next();
	} catch (err) {
		res.status(401).json({ message: "Token inválido" });
	}
};
