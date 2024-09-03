/**
 * Mapea los elementos de un enum a un array de objetos con la estructura: key: string, value: string
 * @param enumObj Enum a mapear
 * @param valueModifier Función opcional para modificar el valor de los elementos del enum (por ejemplo, para normalizar el texto)
 * @returns Array de objetos con las propiedades key y value
 */
export function mapEnumElements(enumObj: object, valueModifier?: (value: any) => string): {
    key: string,
    value: string
}[] {
    return Object.entries(enumObj).map(([key, value]: [string, string]): { key: string, value: string } => ({
        key,
        value: valueModifier ? valueModifier(value) : value
    }));
}

/**
 * Convierte una imagen a base64 para transferencia segura
 * @param image Archivo de imagen a convertir
 * @returns Promise que resuelve en una cadena base64 representando los bytes de la imagen
 */
export function imageToBase64(image: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!(image instanceof Blob)) {
            reject(new Error("El objeto proporcionado no es un archivo válido."));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            // FileReader.readAsDataURL ya devuelve la imagen en formato base64 como parte de una data URL
            const base64 = reader.result as string;
            resolve(base64);
        };
        reader.onerror = (error) => {
            console.error("Error de FileReader: ", error);
            reject(new Error("Error de FileReader"));
        };
        reader.readAsDataURL(image); // Cambiado de readAsArrayBuffer a readAsDataURL
    });
}