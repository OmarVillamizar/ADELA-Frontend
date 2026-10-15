/**
 * Grupos para un selector de cuestionarios: generales de ADELA y propios. Sin
 * propios (un profesor base solo tiene generales) devuelve un único grupo sin
 * etiqueta, para no mostrar un encabezado de más.
 */
export const agruparPorTipo = (cuestionarios) => {
  const propios = cuestionarios.filter((c) => !c.general)
  if (propios.length === 0) return [{ etiqueta: null, items: cuestionarios }]
  return [
    {
      etiqueta: 'Generales de ADELA',
      items: cuestionarios.filter((c) => c.general),
    },
    { etiqueta: 'Mis cuestionarios', items: propios },
  ].filter((g) => g.items.length > 0)
}
