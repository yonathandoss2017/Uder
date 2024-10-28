/**
 * Opciones de configuración para NextAuth.
 * - Define las páginas personalizadas de inicio de sesión, cierre de sesión y registro.
 * - Define los proveedores de autenticación (Google y credenciales).
 * - Define los eventos que se ejecutan después de ciertas acciones (cierre de sesión).
 * - Define los callbacks que se ejecutan después de ciertas acciones (autenticación, creación de token y sesión).
 */

// Importamos los módulos necesarios
import {NextAuthOptions, User} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import {buscarClientePorToken, loginCredentials, renovarToken} from "@/services/SessionService";
import {cookies} from "next/headers";

// Opciones de configuración para NextAuth
const authOptions: NextAuthOptions = {
    pages: {
        signIn: '/login',        // Página personalizada de inicio de sesión
        signOut: '/logout',      // Página personalizada de cierre de sesión
        newUser: '/login',       // Página a la que se redirige después de registrarse
        error: '/login/google'   // Página a la que se redirige en caso de error (Google)
    },
    providers: [
        // Proveedor de autenticación de Google
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,        // ID de cliente de Google
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string // Clave secreta de Google
        }),

        // Proveedor de autenticación por credenciales (Nombre de usuario y contraseña)
        CredentialsProvider({
            name: "Credenciales", // Nombre del proveedor mostrado en el formulario de inicio de sesión
            credentials: {        // Campos del formulario de inicio de sesión
                username: {label: "Username", type: "text"},       // Campo para el nombre de cliente
                password: {label: "Password", type: "password"}    // Campo para la contraseña
            },

            async authorize(credentials) {
                // Evento que se ejecuta cuando el cliente intenta iniciar sesión
                if (!credentials) return null;
                // Enviamos las credenciales al backend para autenticar al cliente y obtener el token de sesión en la API
                const response: string | FetchAPIError = await loginCredentials(credentials.username, credentials.password);
                if (isFetchAPIError(response)) {
                    console.error("ERROR - NextAuth_CredentialsProvider_authorize: ", response);
                    throw new Error(response.errorMessage);
                } else {
                    cookies().set({
                        name: 'sessionToken',
                        value: response,
                        httpOnly: false,
                        secure: true,
                        sameSite: 'strict',
                        maxAge: 300,
                        path: '/',
                    })
                }
                // Retornamos un objeto con el token de sesión en la API para persistirlo en el JWT (JSON Web Token)
                return {
                    sessionAPIToken: response,
                } as User;

            }

        })
    ],
    callbacks: {
        // Definimos los callbacks que se ejecutan después de ciertas acciones (autenticación, creación de token y sesión)

        async signIn({account}) {

            // Método que se ejecuta después de que el cliente se ha autenticado
            if (account?.provider === "google") {
                const googleIdToken: string | undefined = account.id_token;

                // Si el token de Google no existe, significa que la autenticación ha fallado
                if (!googleIdToken) {
                    return false;
                }
            }
            return true;
        },

        async jwt({token, account, user, trigger, session}) {
            // Método que se ejecuta después de que se ha creado el JWT (JSON Web Token)

            // Si el objeto user existe guardamos los datos del cliente en el JWT (JSON Web Token)
            if (user) {
                token.user = user;
            }

            // Si el objeto account existe significa que el cliente se ha autenticado por un proveedor externo (Google)
            if (account) {
                // Persistimos el token de sesión de Google en el JWT (JSON Web Token)
                token.user.sessionGoogleToken = account.id_token;
            }

            // Si el trigger es "update", modificamos el
            if (trigger === "update" && session) {
                console.log("JWT - Trigger: update");
                token.user = session.user;
            }

            const cacheDuration = 5 * 60 * 1000;

            if(cookies().get('sessionToken')?.value !== undefined) {
                // Si el token ya tiene un timestamp y está dentro del tiempo de caché, no hacer la llamada
                if (token.user.lastFetched && (Date.now() - token.user.lastFetched < cacheDuration)) {
                    console.log("estoy dentro del if no hago la llamada")
                    return token;
                }else {
                    console.log("ESTOY EN EL JWT ", cookies().get('sessionToken')?.value)
                    token.user.sessionAPIToken = cookies().get('sessionToken')?.value;
                    token.user.exp = Date.now() + 300000;

                    const response = await buscarClientePorToken(cookies().get('sessionToken')!!.value);
                    if (isFetchAPIError(response)) {
                        throw new Error(response.errorMessage);
                    }
                    token.user.data = response;
                    token.user.lastFetched = Date.now();
                }
            }

            return token;

        },

        async session({session, token}) {

            session.user.sessionAPIToken = cookies().get('sessionToken')?.value

            // Método que se ejecuta después de que se ha creado la sesión de cliente

            if (token.user.sessionGoogleToken) {
                session.user.sessionGoogleToken = token.user.sessionGoogleToken;
            }

            // session.user.error = token.user.error;
            const sessionToken = cookies().get('sessionToken')?.value
            console.log("TENGO COOKIE")
            console.log(sessionToken)
            // Si el JWT (JSON Web Token) tiene el token de sesión del cliente en la API, lo guardamos en la sesión y obtenemos los datos del cliente
            if (sessionToken) {
                console.log("TOKEN COOKIE DESDE EL SESSION", cookies().get('sessionToken')?.value)
                session.user.sessionAPIToken = cookies().get('sessionToken')?.value
                try {
                    if(cookies().get('sessionToken')?.value !== undefined) {
                        {
                            session.user.data = token.user.data;
                            session.user.sessionAPIToken = cookies().get('sessionToken')?.value;
                            session.user.expires = token.user.exp
                            console.log(session.expires, "Expiracion del session auth")
                        }
                    }
                } catch (error) {
                    console.error("Error al buscar cliente por token: ", error);
                    session.user.sessionAPIToken = undefined;
                    session.user.error = "invalid_token"
                }
            } else {
                console.log("EN EL ELSE DEL SESSION")
                session.user.sessionAPIToken = undefined;
                session.user.error = "invalid_token"
            }
            // Retornamos la sesión de cliente modificada
            console.log("SESSION", session)
            return session;

        },
    },
};

// Exporta las opciones de autenticación
export default authOptions;
