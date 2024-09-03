import UsuarioDTO from "@/types/dtos/UsuarioDTO";

declare module "next-auth" {
    /**
     * Retornado por `useSession`, `getSession` y recibido como prop en el React Context `SessionProvider`
     */
    interface Session {
        user: {
            /**
             * Token de sesión del cliente en la API
             */
            sessionAPIToken?: string

            /**
             * Token de sesión del usuario en Google
             */
            sessionGoogleToken?: string

            /**
             * Datos del usuario
             */
            data?: UsuarioDTO

            /**
             * Indica un error al iniciar sesión
             * (Por ejemplo, tokén de sesión inválida del lado de la API)
             */
            error?: string

            /**
             * (Al iniciar sesión con Google) Indica el nombre completo del usuario
             */
            name?: string;

            /**
             * (Al iniciar sesión con Google) Indica el correo electrónico del usuario
             */
            email?: string
        };
    }


    interface User {
        sessionAPIToken?: string
    }

    interface Account {
        sessionAPIToken?: string
    }
}

declare module "next-auth/jwt" {
    /**
     * Retornado por `jwt` y `getToken`, cuando se usan sesiones JWT
     */
    interface JWT {
        /**
         * Información del usuario
         */
        user: {
            /**
             * Token de sesión del cliente en la API
             */
            sessionAPIToken?: string

            /**
             * Token de sesión del usuario en Google
             */
            sessionGoogleToken?: string

            /**
             * Datos del usuario
             */
            data?: UsuarioDTO

            /**
             * Indica un error al iniciar sesión
             * (Por ejemplo, tokén de sesión inválida del lado de la API)
             */
            error?: string
        },

    }
}
