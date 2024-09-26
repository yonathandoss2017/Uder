// ===============================================================
// Este archivo se encarga de redirigir a los usuarios que intentan
// acceder a rutas protegidas sin haber iniciado sesión.
// ===============================================================

// Importa los módulos necesarios
import {getToken, JWT} from 'next-auth/jwt'; // Importa funciones relacionadas con JWT de NextAuth
import {NextRequest, NextResponse} from 'next/server';
import {cookies} from "next/headers"; // Importa clases relacionadas con Next.js server-side

// Define la función middleware
async function middleware(req: NextRequest): Promise<NextResponse> {
    // Obtiene el token de sesión JWT desde la solicitud
    const token: JWT | null = await getToken({req});
    const isAuthenticated: boolean = !!token; // Verifica si el usuario está autenticado
    const hassessionAPIToken: boolean = !!token?.user?.sessionAPIToken; // Verifica si existe un token de sesión válido
    const {pathname}: { pathname: string } = req.nextUrl; // Obtiene la ruta solicitada desde la URL

    // Maneja redirecciones basadas en la ruta solicitada
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
        // Redirige al usuario a la página principal si ya está autenticado y trata de acceder a /login o /signup
        if (hassessionAPIToken) {
            return NextResponse.redirect(new URL('/', req.url));
        } else if (pathname.startsWith('/signup') && !pathname.includes('google') && !isAuthenticated) {
            // Redirige al usuario a la página de inicio de sesión si intenta registrarse sin autenticarse (Google)
            return NextResponse.redirect(new URL('/login', req.url));
        }
    } else if (pathname.startsWith('/logout')) {
        // Redirige al usuario a la página de inicio de sesión si intenta cerrar sesión y no está autenticado
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    } else if (!hassessionAPIToken && !cookies().get('sessionToken')?.value) {
        // Redirige al usuario a la página de inicio de sesión si intenta acceder a una ruta protegida sin autenticarse
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next(); // Continúa con el siguiente middleware si no se requiere ninguna redirección
}

// Define la configuración del middleware
export const config: { matcher: string[] } = {
    matcher: [
        /*
         * Coinciden con todas las rutas de petición excepto las que empiezan por:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon-blanco.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon-blanco.ico).*)',
    ],
}

// Exporta el middleware
export default middleware;
