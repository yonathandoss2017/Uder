export default interface FetchAPIError {
    errorMessage: string;
    status: number;
}

export function isFetchAPIError(error: any): error is FetchAPIError {
    // Verifica si el error es un objeto, no es nulo y tiene la propiedad 'errorMessage'
    return typeof error === 'object' // Si el error es un objeto
        && error !== null // Si el error no es nulo (En JavaScript, null es un objeto)
        && 'errorMessage' in error; // Si el error tiene la propiedad 'errorMessage'
}