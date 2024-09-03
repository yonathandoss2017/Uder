// ===========================================================================
// Este archivo contiene la configuración de NextAuth.js
// el cual es un framework para autenticación de usuarios en Next.js
// ===========================================================================

// Importamos las dependencias necesarias
import NextAuth from "next-auth"; // Importamos la función principal de NextAuth
import authOptions from "@/utils/authOptions"; // Importamos las opciones de configuración de autenticación

/**
 * Configura NextAuth para gestionar la autenticación de usuarios.
 * @param authOptions - Opciones de configuración de NextAuth.
 * @returns {Promise<any>} - Promesa que devuelve el handler de NextAuth.
 */
const handler = NextAuth(authOptions);

// Exportamos el handler para las rutas GET y POST
export { handler as GET, handler as POST };
