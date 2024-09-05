"use client"; // Indica que este componente se ejecuta en el cliente

import styles from "@public/styles/modules/sidebar.module.css";
import {useSession} from "next-auth/react";
import {usePathname} from "next/navigation";
import Avatar from 'react-avatar';
import Link from "next/link";
import React, {ReactElement, useEffect, useState} from "react";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import {Session} from "next-auth";
import PermisoEnum from "@/types/enums/PermisoEnum";
import {obtenerPermisos} from "@/services/SessionService";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";

// Configuración de los ítems de la barra lateral
const sidebarConfig = [
    {title: "Panel Principal", path: "/"},
    {
        title: "Gestión de Usuarios",
        key: "usuarios",
        submenus: [
            {
                title: "Registro de Usuarios", path: "/usuarios/registrar", permission: PermisoEnum.REACTIVAR_USUARIO
            },
            {
                title: "Listado de Usuarios", path: "/usuarios", permission: PermisoEnum.OBTENER_USUARIOS
            },
        ]
    },
    {
        title: "Gestión de Equipos",
        key: "equipos",
        submenus: [
            {
                title: "Ingreso de Equipo", path: "/equipos/agregar", permission: PermisoEnum.ALTA_EQUIPO
            },
            {
                title: "Listado de Equipos", path: "/equipos", permission: PermisoEnum.OBTENER_EQUIPOS
            },
        ]
    },
    {
        title: "Gestiòn de Marca",
        key: "marcas",
        submenus: [
            {
                title: "Ingreso de Marca", path: "/marcas/agregar", permission: PermisoEnum.ALTA_MARCA
            },
            {
                title: "Listado de Marcas", path: "/marcas", permission: PermisoEnum.OBTENER_MARCA
            },
        ]
    },
];

const Sidebar = (): ReactElement | null => {
    // Obtiene la ruta actual y la sesión del usuario
    const pathname: string = usePathname();
    const {data: sessionData}: { data: Session | null } = useSession();
    const clientData: UsuarioDTO = sessionData?.user.data as UsuarioDTO;

    // Define un estado para almacenar los permisos del usuario
    const [permissions, setPermissions] = useState<PermisoEnum[]>([]);

    // Estado para gestionar qué menú está abierto
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    useEffect(() => {
        (async (): Promise<void> => {
            const response: PermisoEnum[] | FetchAPIError = await obtenerPermisos(sessionData?.user.sessionAPIToken as string);
            if (isFetchAPIError(response)) {
                console.error("ERROR - obtenerPermisos: ", response);
                setPermissions([]);
                return;
            }

            setPermissions(response);
        })();
    }, []);

    useEffect(() => {
        // Encuentra la sección cuyo submenú está siendo visualizado actualmente
        const matchedSection = sidebarConfig.find(section =>
            section.submenus?.some(submenu => pathname.startsWith(submenu.path))
        );
        // Abre el menú correspondiente
        if (matchedSection) {
            setOpenMenu(matchedSection.key as string);
        }
    }, [pathname]); // Dependencia: se ejecuta cuando cambia la ruta

    // Devuelve la clase CSS adecuada según si el menú está abierto o no
    const getMenuClass = (sectionKey: string, submenus?: { path: string }[]) => {
        if (submenus?.some(submenu => pathname.startsWith(submenu.path))) {
            return openMenu === sectionKey ? styles.subMenuTitleOpen : styles.subMenuTitleClosed;
        }
        return openMenu === sectionKey ? styles.subMenuTitleOpen : "";
    };

    return (
        <nav className={styles.sidebarContainer}>
            {/* Título de la barra lateral */}
            <div className={styles.sidebarTitle}>Digital Disruption</div>
            <ul className={styles.sidebarList}>
                {/* Mapea la configuración de la barra lateral */}
                {sidebarConfig.map((section) => {
                    // Filtra los submenús según los permisos del usuario
                    const visibleSubmenus = section.submenus?.filter(submenu => {
                            // Verifica si el permiso del submenú está en la lista de permisos del usuario
                            return permissions.find((p: PermisoEnum): boolean => p.toString() === PermisoEnum[submenu.permission]) !== undefined;
                        }
                    );

                    // No mostrar la sección si no hay submenús visibles
                    if (section.submenus && visibleSubmenus?.length === 0) return null;

                    return (
                        <React.Fragment key={section.title}>
                            {section.submenus ? (
                                <li className={styles.sidebarListItem} key={section.key}>
                                    {/* Botón que alterna el estado del menú */}
                                    <button
                                        className={`${styles.sidebarOption} ${styles.sidebarButton} ${getMenuClass(section.key, section.submenus)}`}
                                        onClick={() =>
                                            setOpenMenu(openMenu === section.key ? null : section.key)
                                        }
                                    >
                                        {section.title}
                                    </button>
                                    {/* Submenús que se muestran si el menú está abierto */}
                                    {openMenu === section.key && (
                                        <ul className={styles.subMenuContainer}>
                                            {section.submenus.map((submenu) => (
                                                <li
                                                    key={submenu.path}
                                                    className={`${pathname === submenu.path ? styles.activeOption : ""}`}
                                                >
                                                    <Link
                                                        href={submenu.path}
                                                        className={`${styles.sidebarOption} ${styles.subMenuButton} ${styles.subMenuOption}`}
                                                    >
                                                        • {submenu.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ) : (
                                <>
                                    {/* Elemento de menú sin submenús */}
                                    <li className={`${styles.sidebarListItem} ${pathname === section.path ? styles.activeOption : ""}`}
                                        key={section.path}>
                                        <Link
                                            href={section.path}
                                            className={`${styles.sidebarOption} ${pathname === section.path ? styles.activeOption : ""}`}
                                        >
                                            {section.title}
                                        </Link>
                                    </li>
                                </>
                            )}
                        </React.Fragment>
                    )
                })}
            </ul>

            {/* Información del usuario */}
            <div className={styles.userInfo}>
                <Avatar
                    name={`${clientData.primerNombre} ${clientData.primerApellido}`}
                    size="50"
                    round={true}
                    alt="Foto de perfil"
                />
                <h3 className={styles.userInfoTitle}>{clientData.nombreUsuario}</h3>
                <Link href={"/modificar"} className={styles.userInfoLink}>Modificar Usuario</Link>
                <Link href={"/logout"} className={styles.userInfoLink}>Cerrar sesión</Link>
            </div>
        </nav>
    );
}

export default Sidebar;
