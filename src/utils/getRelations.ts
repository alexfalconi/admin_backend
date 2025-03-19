import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getRelations(table: string) {
	try {
		const relations = await prisma.$queryRawUnsafe<
			{ COLUMN_NAME: string; REFERENCED_TABLE_NAME: string }[]
		>(
			`SELECT COLUMN_NAME, REFERENCED_TABLE_NAME
			 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
			 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
			table
		);
		return relations.map((rel) => ({
			field: rel.COLUMN_NAME,
			relatedTable: rel.REFERENCED_TABLE_NAME,
		}));
	} catch (error) {
		console.error(`Erro ao buscar relações para ${table}:`, error);
		return [];
	}
}
