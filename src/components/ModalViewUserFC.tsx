import React, {ReactElement, useEffect, useState} from "react";
import {buscarPerfilPorId} from "@/services/PerfilService";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import styles from "@public/styles/modules/modal.view.data.module.css"
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import ModalViewTelefonoFC from "@/components/ModalViewTelefonoFC"
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";
import {useToken} from "@/app/hooks/TokenProvider";


interface ModalViewUserProps {
    user: UsuarioDTO;
    idAdministrador ?: number;
}

const ModalViewUserFC = ({ user, idAdministrador }: ModalViewUserProps): ReactElement => {

    // Obtenemos el token de sesión del cliente
    const {sessionAPIToken } = useToken();

    const {createModal} = useModal();

    //Perfil del usuario
    const [perfil, setPerfil] = useState<string>("");

    //Bandera de cargando
    const [loaded, setLoaded]: [boolean,(value: boolean) => void] = useState<boolean>(false);

    useEffect(() => {

        async function obtenerPerfil() {

            if(!sessionAPIToken) return;

            if (user.idPerfil) { //Si el usuario tiene perfil
                const response: PerfilDTO | FetchAPIError = await buscarPerfilPorId(user.idPerfil, sessionAPIToken); //Lo buscarmos
                if (isFetchAPIError(response)) { //Si ocurre un error en el fetch
                    console.error('Error al obtener el perfil', response);
                } else {
                    await setPerfil(response.nombre); //Se setea el perfil
                    setLoaded(true); //Carga completada
                }
            } else {
                if(!perfil && idAdministrador == user.id){ //Si el usuario no tiene perfil y es administrador
                    setPerfil("Administrador")
                }else{
                    setPerfil("Sin perfil") //Sino no tiene perfil
                }
                setLoaded(true); //Carga completada
            }
        }
        obtenerPerfil();
    }, [user.idPerfil]);

    if(!loaded){ //Si no han cargado los datos
        return <span><b>Cargando...</b></span>; //Muestra pagina cargando
    }
    // Retorna el JSX del mensaje de vista
    return (
        <div className={`${styles.container}`}>
            <h2>Datos del Usuario</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Primer Nombre</label>
                    <p className={styles.detailsValue}>{user.primerNombre}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Segundo Nombre</label>
                    <p className={styles.detailsValue}>{user.segundoNombre ? user.segundoNombre : "-"}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Primer Apellido</label>
                    <p className={styles.detailsValue}>{user.primerApellido}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Segundo Apellido</label>
                    <p className={styles.detailsValue}>{user.segundoApellido ? user.segundoApellido : "-"}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Cédula</label>
                    <p className={styles.detailsValue}>{user.cedula}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Correo electrónico</label>
                    <p className={styles.detailsValue}>{user.email}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Fecha de Nacimiento</label>
                    <p className={styles.detailsValue}>
                        {new Date(user.fechaNacimiento).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Estado</label>
                    <p className={styles.detailsValue}>{user.estado}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Perfil</label>
                    <p className={styles.detailsValue}>{perfil}</p>
                </div>
                <div className={styles.inputBox}>
                    <button className={styles.btnTelefonos} onClick={() => createModal({
                        children: (
                            <ModalViewTelefonoFC user={user}/>
                            ),buttonsType: ModalButtonsType.CLOSE
                        }).show()}
                    > Teléfonos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalViewUserFC;
