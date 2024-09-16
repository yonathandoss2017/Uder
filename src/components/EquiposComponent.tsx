"use client"

// Componente separado para manejar los hooks del cliente
import TableEquiposFC from "@/app/(pages)/(whiteBackground)/equipos/(lista)/table";
import React, {useEffect, useState} from "react";
import ErrorFC from "@/components/ErrorFC";
import {useModal} from "@/app/hooks/modals/useModal";
import {useRouter} from "next/router";
import {renovarToken, verificarPermiso} from "@/services/SessionService";
import PermisoEnum from "@/types/enums/PermisoEnum";
import {ModalButtonsType} from "@/components/ModalFC";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";

// Define los tipos para los props
interface EquiposComponentProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

// Componente separado para manejar los hooks del cliente
const EquiposComponent: React.FC<EquiposComponentProps> = ({ sessionAPIToken, clientData }) => {
    const { createModal } = useModal();

    const [hasPermissionEdit, setHasPermissionEdit] = useState(false);
    const [hasPermissionBaja, setHasPermissionBaja] = useState(false);
    const [hasPermissionView, setHasPermissionView] = useState(false);

    useEffect(() => {
        // Verifica los permisos del usuario
        const checkPermissions = async () => {
            const viewPerm = await verificarPermiso(sessionAPIToken, PermisoEnum.OBTENER_EQUIPOS);
            if (!viewPerm) {
                return <ErrorFC message={"Acceso denegado"} />;
            }

            setHasPermissionView(viewPerm);
            setHasPermissionEdit(await verificarPermiso(sessionAPIToken, PermisoEnum.MODIFICACION_EQUIPO));
            setHasPermissionBaja(await verificarPermiso(sessionAPIToken, PermisoEnum.BAJA_EQUIPO));

            // Configura el timer para renovar el token
            const timer = setTimeout(() => {
                createModal({
                    children: (
                        <p>Su sesión está por expirar, quiere renovarla?</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM_CANCEL,
                    onConfirm: async (): Promise<void> => {
                        console.log("Renovando token en page");
                        const response: string | FetchAPIError = await renovarToken(sessionAPIToken);
                        if (isFetchAPIError(response)) {
                            console.error("ERROR - EquiposPage_renovarToken: ", response);
                            throw new Error(response.errorMessage);
                        }
                        window.location.reload();
                    },
                    onCancel: (): void => {
                        console.log("Cancelando renovación de token");
                        window.location.href = "/logout";
                    }

                }).show();
            }, 15000);

            return () => clearTimeout(timer);
        };

        checkPermissions();
    }, [sessionAPIToken]);

    // Muestra la tabla solo si tiene permiso para ver
    if (!hasPermissionView) {
        return <ErrorFC message={"Acceso denegado"}/>;
    }
    return (
        <main>
            <TableEquiposFC
                sessionAPIToken={sessionAPIToken}
                hasPermissionBaja={hasPermissionBaja}
                hasPermissionEdit={hasPermissionEdit}
                hasPermissionView={hasPermissionView}
                idInstitucion={clientData.idInstitucion}
            />
        </main>
    );
};

export default EquiposComponent;