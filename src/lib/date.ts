/**
 * Converte uma string de data do Supabase/Prisma para Date.
 * O Supabase retorna timestamps sem indicador de timezone,
 * então adicionamos 'Z' para garantir interpretação como UTC.
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'Z');
}
