"use client";

import React, {ChangeEvent, MutableRefObject, ReactElement, useEffect, useRef, useState} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import PerfilDTO from "@/types/dtos/PerfilDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {darBajaPerfil, listarPerfiles} from "@/services/PerfilService";
import PerfilFilter from "@/types/filters/PerfilFilter";
import stylesTable from "@public/styles/modules/table/table.tipoequipos.module.css";
import {ModalInstance} from "@/app/hooks/modals/ModalProvider";
import EditPerfilForm from "@/app/(pages)/(whiteBackground)/perfiles/(lista)/formEdit";
import {ModalButtonsType} from "@/components/ModalFC";

interface TablePerfilesFCProps {
    sessionAPIToken: string;
    hasPermissionEdit: boolean;
    hasPermissionBaja: boolean;
    hasPermissionView: boolean;
    idInstitucion: number;
}

interface TableSearchTermsProps {
    filter: PerfilFilter;
}

function TablePerfilesFC(props: Readonly<TablePerfilesFCProps>): ReactElement {

    const {createModal} = useModal();

    const [searchTerms, setSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>({
        filter: {activo: true, idInstitucion: props.idInstitucion}
    });

    const [appliedSearchTerms, setAppliedSearchTerms]: [TableSearchTermsProps, (value: TableSearchTermsProps) => void]
        = useState<TableSearchTermsProps>(searchTerms);

    const [perfiles, setPerfiles]: [PerfilDTO[], (value: PerfilDTO[]) => void]
        = useState<PerfilDTO[]>([]);

    const [errorMsg, setErrorMsg]: [string, (value: string) => void]
        = useState<string>("");

    const searchTermsRef: MutableRefObject<TableSearchTermsProps> = useRef<TableSearchTermsProps>(searchTerms);

    useEffect(() => {
        void applySearch();
    }, [appliedSearchTerms]);

    const applySearch = async (): Promise<void> => {
        const fetchedPerfiles: PerfilDTO[] | FetchAPIError =
            await listarPerfiles(props.idInstitucion, props.sessionAPIToken, appliedSearchTerms.filter);
        if (isFetchAPIError(fetchedPerfiles)) {
            setErrorMsg(fetchedPerfiles.errorMessage);
            return;
        }
        setPerfiles(fetchedPerfiles);
    };

    const handleApplySearch = async (event: ChangeEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setAppliedSearchTerms(searchTermsRef.current);
    };

    const handleDarBaja = async (perfilId: number): Promise<void> => {
        const response: void | FetchAPIError = await darBajaPerfil(perfilId, props.sessionAPIToken);
        if (isFetchAPIError(response)) {
            setErrorMsg(response.errorMessage);
            return;
        }

        setPerfiles(perfiles.filter((perfil) => perfil.id !== perfilId));

        createModal({
            children: (
                <p>Perfil dado de baja correctamente</p>
            ),
            buttonsType: ModalButtonsType.CONFIRM
        }).show();
    };

    const handleEditPerfil = (perfil: PerfilDTO): void => {
        createModal({
            title: "Editar Perfil",
            children: (
                <EditPerfilForm
                    sessionAPIToken={props.sessionAPIToken}
                    editingPerfil={perfil}
                    idInstitucion={props.idInstitucion}
                    onCancel={() => {
                        createModal({
                            children: (
                                <p>Edición cancelada</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                    }}
                    onSave={() => {
                        createModal({
                            children: (
                                <p>Perfil modificado correctamente</p>
                            ),
                            buttonsType: ModalButtonsType.CONFIRM
                        }).show();
                        void applySearch();
                    }}
                />
            )
        }).show();
    };

    return (
        <section className={stylesTable.tableContainer}>
            <form className={stylesTable.searchContainer} onSubmit={handleApplySearch}>
                <input
                    type="text"
                    placeholder="Buscar por nombre"
                    onChange={(e) => searchTermsRef.current = {...searchTermsRef.current, filter: {...searchTermsRef.current.filter, nombre: e.target.value}}}
                />
                <input
                    type="number"
                    placeholder="Buscar por nivel"
                    onChange={(e) => searchTermsRef.current = {...searchTermsRef.current, filter: {...searchTermsRef.current.filter, nivel: Number(e.target.value)}}}
                />
                <button type="submit">Buscar</button>
            </form>

            {errorMsg && <p className="error-message">{errorMsg}</p>}

            <table className={stylesTable.table}>
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Nivel</th>
                    {props.hasPermissionEdit && <th>Acciones</th>}
                </tr>
                </thead>
                <tbody>
                {perfiles.map((perfil) => (
                    <tr key={perfil.id}>
                        <td>{perfil.nombre}</td>
                        <td>{perfil.nivel}</td>
                        {props.hasPermissionEdit && (
                            <td>
                                <button onClick={() => handleEditPerfil(perfil)}>Editar</button>
                                {props.hasPermissionBaja && (
                                    <button onClick={() => handleDarBaja(perfil.id)}>Dar Baja</button>
                                )}
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </section>
    );
}

export default TablePerfilesFC;
