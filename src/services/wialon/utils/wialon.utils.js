export function extractCustomFields(customFields, fieldNames = []) {
  if (!customFields || !fieldNames.length) return {};

  // Normalizamos nombres buscados para evitar problemas de espacios/números
  const normalize = (str) =>
    str.replace(/^\d+\s*/, "").trim().toUpperCase();

  const wanted = fieldNames.map(normalize);
  const result = {};

  Object.values(customFields).forEach((field) => {
    const normalizedName = normalize(field.n);

    if (wanted.includes(normalizedName)) {
      result[normalizedName] = field.v?.trim() ?? "";
    }
  });

  return result;
}
