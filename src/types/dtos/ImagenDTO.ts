export default interface ImagenDTO {
    id?: number;
    nombre?: string;
    url?: string;
    tipoImagen: string;
    idEquipo: number;
    base64Content: string;
}