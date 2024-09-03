/**
 * Cambio que se realizó en un campo de una entidad
 * (Se utiliza para listar los cambios realizados en una modificación)
 */
export default interface ChangeEntry {
    field: string; // Campo modificado
    previousValue?: string | number | boolean | Date; // Valor anterior
    nextValue?: string | number | boolean | Date; // Nuevo valor
}