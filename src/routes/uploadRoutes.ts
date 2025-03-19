import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { uploadSingle, uploadMultiple } from "@middlewares/uploadMiddleware";

const prisma = new PrismaClient();
const router = Router();

//upload de uma imagem
router.post("/:table/upload", uploadSingle, (req: Request, res: Response) => {
	if (!req.file) {
		res.status(400).json({ error: "Nenhuma imagem enviada" });
		return;
	}
	res.json({ imageUrl: req.file.filename });
});

//upload de várias imagens
router.post("/:table/upload-gallery/:id", uploadMultiple, async (req: Request, res: Response) => {
	try {
		const images = (req.files as Express.Multer.File[]).map((f) => f.filename);
		const { table, id } = req.params;

		if (!images.length) {
			res.status(400).json({ error: "Nenhuma imagem enviada." });
			return;
		}

		for (const img of images) {
			await prisma.$executeRawUnsafe(
				`INSERT IGNORE INTO ${table}_gallery (item_id, image) VALUES (?, ?)`,
				id,
				`${process.env.API_URL}uploads/${table}/${img}`
			);
		}

		res.json({ message: "Imagens enviadas com sucesso!", images });
	} catch (error) {
		console.error("Erro ao salvar imagens:", error);
		res.status(500).json({ error: "Erro ao salvar imagens", details: error });
	}
});

// deleta a imagem da galeria
router.delete("/:table_gallery/:id", async (req, res) => {
	const { table_gallery, id } = req.params;

	try {
		await prisma.$executeRawUnsafe(`DELETE FROM ${table_gallery} WHERE id = ?`, id);
		res.json({ message: "Imagem deletada com sucesso!" });
	} catch (error) {
		console.error("Erro ao deletar imagem da galeria:", error);
		res.status(500).json({ error: "Erro ao deletar imagem da galeria", details: error });
	}
});

export default router;
