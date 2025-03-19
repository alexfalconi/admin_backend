import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { getRelations } from "@utils/getRelations.ts";

const prisma = new PrismaClient();
const router = Router();

interface Field {
	Field: string;
	Type: string;
}

const tables = ["users", "banners", "news", "news_categories", "news_gallery"];

tables.forEach((table) => {
	const basePath = `/${table}`;

	// lista os campos da tabela
	router.get("/fields/:table", async (req, res) => {
		const { table } = req.params;

		// campos para não incluir
		const excludedFields = ["id", "created_at", "update_at"];

		try {
			const fields: Field[] = await prisma.$queryRawUnsafe(`DESCRIBE ${table}`);
			const formattedFields = fields
				.filter((field) => !excludedFields.includes(field.Field)) // Filtrar os campos excluídos
				.map((field) => ({
					label: field.Field,
					type: field.Type.includes("int")
						? "number"
						: field.Type.includes("varchar") || field.Type.includes("text")
						? "text"
						: field.Type.includes("boolean")
						? "checkbox"
						: "text",
				}));
			res.json(formattedFields);
		} catch (error) {
			res.status(500).json({ error: "Erro ao buscar campos da tabela", details: error });
		}
	});

	// Listar todos os registros da tabela
	router.get(basePath, async (req, res) => {
		try {
			const relations = await getRelations(table);
			const includes = relations.reduce((acc, rel) => {
				acc[rel.field.replace("_id", "")] = true;
				return acc;
			}, {} as Record<string, boolean>);

			const model = prisma[table as keyof PrismaClient];
			const records = await (model as any).findMany({ include: includes });

			res.json(records);
		} catch (error) {
			res.status(500).json({ error: "Erro ao buscar registros", details: error });
		}
	});

	// Buscar um registro por ID
	router.get(`${basePath}/:id`, async (req, res) => {
		const { id } = req.params;
		try {
			const record = await prisma.$queryRawUnsafe<{ [key: string]: any }[]>(
				`SELECT * FROM ${table} WHERE id = ?`,
				Number(id)
			);

			if (record.length > 0) {
				res.json(record[0]);
			} else {
				res.status(404).json({ error: "Registro não encontrado" });
			}
		} catch (error) {
			res.status(500).json({ error: "Erro ao buscar registro", details: error });
		}
	});

	// Buscar um registro por coluna e valor dinâmico
	router.get(`${basePath}/:column/:value`, async (req, res) => {
		const { column, value } = req.params;
		try {
			const records = await prisma.$queryRawUnsafe<{ [key: string]: any }[]>(
				`SELECT * FROM ${table} WHERE ${column} = ?`,
				Number(value)
			);

			if (records.length > 0) {
				res.json(records);
			} else {
				res.status(404).json({ error: "Registro não encontrado" });
			}
		} catch (error) {
			res.status(500).json({ error: "Erro ao buscar registro", details: error });
		}
	});

	// Criar um novo registro
	router.post(basePath, async (req, res) => {
		try {
			// Verifique se o campo 'image' existe e adiciona o caminho absoluto
			if (
				req.body.image &&
				!req.body.image.startsWith("http://") &&
				!req.body.image.startsWith("https://")
			) {
				req.body.image = `${process.env.API_URL}uploads/${table}/${req.body.image}`;
			}

			const columns = Object.keys(req.body).join(", ");
			const values = Object.values(req.body);
			const placeholders = values.map(() => "?").join(", ");

			// Executa a inserção no banco
			await prisma.$executeRawUnsafe(
				`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
				...values
			);

			// Agora cast o tipo para acessar o modelo dinamicamente e usar findFirst
			const model = prisma[table as keyof PrismaClient];

			// Buscar o novo usuário com base no email, agora corrigido com o tipo correto
			const newRecord = await (model as any).findFirst({
				orderBy: {
					id: "desc", // Ordena pelo campo 'id' em ordem decrescente
				},
			});

			// Retorna o novo registro
			res.json(newRecord);
		} catch (error) {
			res.status(500).json({ error: "Erro ao criar registro", details: error });
		}
	});

	// Atualizar um registro
	router.patch(`${basePath}/:id`, async (req, res) => {
		const { id } = req.params;
		try {
			if (
				req.body.image &&
				!req.body.image.startsWith("http://") &&
				!req.body.image.startsWith("https://")
			) {
				req.body.image = `${process.env.API_URL}uploads/${table}/${req.body.image}`;
			}

			const updates = Object.keys(req.body)
				.map((key) => `${key} = ?`)
				.join(", ");
			const values = [...Object.values(req.body), Number(id)];

			const query = `UPDATE ${table} SET ${updates}, updated_at = NOW() WHERE id = ?`;
			await prisma.$executeRawUnsafe(query, ...values);

			// Recuperar os dados atualizados
			const model = prisma[table as keyof PrismaClient];
			const updatedItem = await (model as any).findFirst({
				where: { id: Number(id) },
			});

			res.json(updatedItem);
		} catch (error) {
			res.status(500).json({ error: "Erro ao atualizar registro", details: error });
		}
	});

	// Deletar um registro
	router.delete(`${basePath}/:id`, async (req, res) => {
		const { id } = req.params;
		try {
			await prisma.$executeRawUnsafe(`DELETE FROM ${table} WHERE id = ?`, Number(id));
			res.status(204).send(); // 204 No Content
		} catch (error) {
			res.status(500).json({ error: "Erro ao deletar registro", details: error });
		}
	});
});

export default router;
