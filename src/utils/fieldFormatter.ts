export function formatFields(fields: { Field: string; Type: string }[]) {
	const excludedFields = ["id", "created_at", "update_at"];
	return fields
		.filter((field) => !excludedFields.includes(field.Field))
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
}
