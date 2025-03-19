import multer from "multer";
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto"; // Importando o módulo crypto para gerar um identificador único

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const table = req.params.table;
		const uploadPath = `uploads/${table}`;
		if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		// Gerar um identificador único para o nome do arquivo
		const uniqueSuffix = crypto.randomBytes(6).toString("hex");
		const extname = path.extname(file.originalname);
		cb(null, `${Date.now()}-${uniqueSuffix}${extname}`);
	},
});

const upload = multer({ storage });

export const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
	upload.single("image")(req, res, (err) => {
		if (err) return res.status(500).json({ error: "Erro no upload", details: err });
		next();
	});
};

export const uploadMultiple = (req: Request, res: Response, next: NextFunction) => {
	upload.array("images", 20)(req, res, (err) => {
		if (err) return res.status(500).json({ error: "Erro no upload múltiplo", details: err });
		next();
	});
};
