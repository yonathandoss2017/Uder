import {ReactElement, useEffect, useState} from "react";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import TelefonoDTO, {formatTelefono} from "@/types/dtos/TelefonoDTO";
import {obtenerTelefonosPorUsuario} from "@/services/TelefonoService";
import styles from "@public/styles/modules/modal.view.data.module.css"

interface ModalTelefonoProps{
    user: UsuarioDTO;
    sessionAPIToken: string;
}

const ModalViewTelefonoFC = ({user, sessionAPIToken}: ModalTelefonoProps): ReactElement => {

    //Telefonos del usuario
    const [telefonos, setTelefonos]: [TelefonoDTO[], (value: TelefonoDTO[]) => void] = useState<TelefonoDTO[]>([]);

    useEffect((): void => {

        // Procedimiento asíncrono auto-ejecutable que actualiza la lista de  teléfonos
        (async (): Promise<void> => {

            // Obtiene los teléfonos del usuario
            await obtenerTelefonosPorUsuario(user.id as number, sessionAPIToken).then((response: TelefonoDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) { // Sí hay un error al obtener los teléfonos del usuario
                    console.error("ERROR - Modificación propia del usuario - obtenerTelefonosPorUsuario: ", response);
                    setTelefonos([]); // Actualiza la lista de teléfonos a un arreglo vacío
                    return;
                }
                setTelefonos(response); // Actualiza la lista de teléfonos
            });
        })();
    }, [user.id, sessionAPIToken]); //Cuando cambia el usuario o el token de sesion

    return (
        <div>
            <h3>Teléfonos del Usuario</h3>

                {telefonos.map((telefono: TelefonoDTO) => (
                    <p key={telefono.id}>
                        <p className={styles.numTelefono}>{formatTelefono(telefono.telefono)}</p>
                    </p>
                ))}
        </div>
    )
}

export default ModalViewTelefonoFC;