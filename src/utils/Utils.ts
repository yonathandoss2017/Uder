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

    // Se retorna una promesa para manejar la operación asíncrona
    return new Promise((resolve, reject) => {
        if (!(image instanceof Blob)) {
            reject(new Error("El objeto proporcionado no es un archivo válido."));
            return;
        }

        // FileReader es una clase que permite leer archivos de forma asíncrona
        const reader = new FileReader();

        // Cuando el archivo se ha leído correctamente
        reader.onload = () => {
            // FileReader.readAsDataURL ya devuelve la imagen en formato base64 como parte de una data URL
            const base64 = reader.result as string;
            resolve(base64); // Se resuelve la promesa con la cadena base64
        };

        // Cuando ocurre un error al leer el archivo
        reader.onerror = (error) => {
            console.error("Error de FileReader: ", error);
            reject(new Error("Error de FileReader")); // Se rechaza la promesa con un error
        };

        // Se inicia la lectura del archivo
        reader.readAsDataURL(image);
    });
}