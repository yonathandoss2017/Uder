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
        title: "Gestión Usuarios",
        key: "usuarios",
        submenus: [
            {
                title: "Registro Usuarios", path: "/usuarios/registrar", permission: PermisoEnum.REACTIVAR_USUARIO
            },
            {
                title: "Listado Usuarios", path: "/usuarios", permission: PermisoEnum.OBTENER_USUARIOS
            },
        ]
    },
    {
        title: "Gestión Equipos",
        key: "equipos",
        submenus: [
            {
                title: "Registro Equipos", path: "/equipos/agregar", permission: PermisoEnum.ALTA_EQUIPO
            },
            {
                title: "Listado Equipos", path: "/equipos", permission: PermisoEnum.OBTENER_EQUIPOS
            },
        ]
    },
    {
        title: "Gestión Tipos Equipo",
        key: "tiposEquipo",
        submenus: [
            {
                title: "Registro Tipos Equipo", path: "/tiposEquipos/agregar", permission: PermisoEnum.ALTA_TIPO_EQUIPO
            },
            {
                title: "Listado Tipos Equipo", path: "/tiposEquipos", permission: PermisoEnum.OBTENER_TIPO_EQUIPOS
            },
        ]
    },
    {
        title: "Gestión Marca",
        key: "marcas",
        submenus: [
            {
                title: "Ingreso Marca", path: "/marcas/agregar", permission: PermisoEnum.ALTA_MARCA
            },
            {
                title: "Listado Marcas", path: "/marcas", permission: PermisoEnum.OBTENER_MARCAS
            },
        ]
    },
    {
        title: "Gestión Modelos",
        key: "modelos",
        submenus: [
            {
                title: "Ingreso Modelo", path: "/modelos/agregar", permission: PermisoEnum.ALTA_MODELO
            },
            {
                title: "Listado Modelos", path: "/modelos", permission: PermisoEnum.OBTENER_MODELOS
            },
        ]
    },
    {
        title: "Gestión Perfiles",

        key: "perfiles",

        submenus: [

            {
                title: "Registro Perfiles", path: "/perfiles/agregar", permission: PermisoEnum.ALTA_PERFIL

            },
            {
                title: "Listado Perfiles", path: "/perfiles", permission: PermisoEnum.OBTENER_PERFILES

            },
        ]

    },

    {
        title: "Gestión Proveedores",
        key: "proveedores",
        submenus: [
            {
                title: "Ingreso Proveedor", path: "/proveedores/agregar", permission: PermisoEnum.ALTA_PROVEEDOR
            },
            {
                title: "Listado Proveedores", path: "/proveedores", permission: PermisoEnum.OBTENER_PROVEEDORES
            },
        ]
    },
    {
        title: "Gestión Funcionalidades",
        key: "funcionalidades",
        submenus: [
            {
                title: "Ingreso Funcionalidad",
                path: "/funcionalidades/agregar",
                permission: PermisoEnum.ALTA_FUNCIONALIDAD
            },
            {
                title: "Listado Funcionalidades",
                path: "/funcionalidades",
                permission: PermisoEnum.OBTENER_FUNCIONALIDADES
            },
        ]
    }
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

    // No renderiza nada si sessionData es null (usuario no autenticado)
    if (!sessionData) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        // Solo obtener permisos si sessionData está disponible
        (async (): Promise<void> => {
            if (sessionData) {
                const response: PermisoEnum[] | FetchAPIError = await obtenerPermisos(sessionData.user.sessionAPIToken as string);
                if (isFetchAPIError(response)) {
                    console.error("ERROR - obtenerPermisos: ", response);
                    setPermissions([]);
                    return;
                }

                setPermissions(response);
            }
        })();
    }, [sessionData]); // Agrego sessionData como dependencia

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
            <div className={styles.sidebarTitle}>Hospital</div>
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
                                            {visibleSubmenus?.map((submenu) => (
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