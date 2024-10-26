import React, {ReactElement, useEffect, useState} from "react";
import styles from "@public/styles/modules/modal.view.data.module.css"
import EquipoDTO from "@/types/dtos/EquipoDTO";
import PaisDTO from "@/types/dtos/PaisDTO";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import ModeloDTO from "@/types/dtos/ModeloDTO";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import {buscarPaisPorId} from "@/services/PaisService";
import {buscarTipoEquipoPorId} from "@/services/TipoEquipoService";
import {buscarProveedorPorId} from "@/services/ProveedorService";
import {buscarMarcaPorId} from "@/services/MarcaService";
import {buscarModeloPorId} from "@/services/ModeloService";
import {Carousel} from "react-responsive-carousel";
import ImagenDTO from "@/types/dtos/ImagenDTO";
import {listarImagenes} from "@/services/ImagenService";
import {useToken} from "@/app/hooks/TokenProvider";


interface ModalViewEquipoFC {
    equipo: EquipoDTO;
}

const ModalViewEquipoFC = ({ equipo }: ModalViewEquipoFC): ReactElement => {

    const {sessionAPIToken } = useToken();

    const [pais, setPais] = useState<string>("");
    const [tipoEquipo, setTipoEquipo] = useState<string>("");
    const [proveedor, setProveedor] = useState<string>("");
    const [marca, setMarca] = useState<string>("");
    const [idMarca, setIdMarca] = useState<number>(0);
    const [modelo, setModelo] = useState<string>("");
    const [msgGarantia, setMsjGarantia] = useState<string>("");

    // Estado para almacenar las imágenes a eliminar (Para el carrusel y eliminarlas al guardar cambios)
    const [currentImageIndex, setCurrentImageIndex]: [number, (value: number) => void] = useState(0)
    // Estado para almacenar las imágenes del equipo (Para el carrusel)
    let [images, setImages]: [ImagenDTO[], (value: ImagenDTO[]) => void] = useState<ImagenDTO[]>([]);

    //Bandera de cargando
    const [loaded, setLoaded]: [boolean,(value: boolean) => void] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    //----------------- Obtenemos datos con ids -----------------

    useEffect(() => {

        (async (): Promise<void> => {

            if (!sessionAPIToken) {
                console.error("El token de sesión es nulo");
                setError("No se ha encontrado el token de sesión. Por favor, inicie sesión nuevamente.");
                return;
            }


            const obtenerTipoEquipo = async() => {
                    const response: TipoEquipoDTO | FetchAPIError = await buscarTipoEquipoPorId(equipo.idTipoEquipo, sessionAPIToken); //Buscamos tipos de equipo por id
                    if (isFetchAPIError(response)) { //Si ocurre un error en el fetch
                        console.error('Error al obtener el tipo de equipo', response);
                    } else {
                        setTipoEquipo(response.nombre); //Se setea el tipo de equipo
                    }
                }

                const obtenerProveedor = async() => {
                    const response: ProveedorDTO | FetchAPIError = await buscarProveedorPorId(equipo.idProveedor, sessionAPIToken); //Buscamos proveedor por id
                    if (isFetchAPIError(response)) { //Si ocurre un error en el fetch
                        console.error('Error al obtener el proveedor', response);
                    } else {
                        setProveedor(response.nombre); //Se setea el proveedor
                    }
                }

                const obtenerModelo = async() => {
                    const response: ModeloDTO | FetchAPIError = await buscarModeloPorId(equipo.idModelo, sessionAPIToken); //Buscamos modelo por id
                    if (isFetchAPIError(response)) { //Si ocurre un error en el fetch
                        console.error('Error al obtener el modelo', response);
                    } else {
                        setModelo(response.nombre); //Se setea el modelo
                        setIdMarca(response.idMarca) //Se setea el id de la marca
                        if (response.idMarca != 0) {
                            const responseMarca: MarcaDTO | FetchAPIError = await buscarMarcaPorId(response.idMarca, sessionAPIToken); //Buscamos la marca por id
                            if (isFetchAPIError(responseMarca)) { //Si ocurre un error en el fetch
                                console.error('Error al obtener la marca', responseMarca);
                            } else {
                                setMarca(responseMarca.nombre); //Se setea la marca
                            }
                        } else {
                            console.error("Ha ocurrido un error al obtener la marca")
                        }
                    }
                }

                if (equipo.garantia.dePorVida) {
                    setMsjGarantia("De por Vida")
                } else if (equipo.fechaExpiracionGarantia != null) {
                    const fecha = new Date(equipo.fechaExpiracionGarantia);
                    let fechaString = fecha.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })
                    if (fecha.getTime() > new Date().getTime()) {
                        setMsjGarantia("Expira el " + fechaString);
                    } else {
                        setMsjGarantia("Expirado (" + fechaString + ")");
                    }
                } else {
                    setMsjGarantia("Sin garantía")
                }

                const obtenerPais = async() =>{
                    const response: PaisDTO | FetchAPIError = await buscarPaisPorId(equipo.idPaisOrigen, sessionAPIToken); //Buscamos pais por id
                    if (isFetchAPIError(response)) { //Si ocurre un error en el fetch
                        console.error('Error al obtener el pais de origen', response);
                    } else {
                        setPais(response.nombre); //Se setea el pais
                    }
                }

                const obtenerImagen= async ()=> {
                    const response: ImagenDTO[] | FetchAPIError = await listarImagenes(equipo.id as number, sessionAPIToken); //Buscamos imagenes por id de equipo
                    if (isFetchAPIError(response)) {
                        console.error("ERROR - Modificar Equipo - listarImagenes: ", response);
                        setImages([]); // Limpia la lista de imágenes
                        return;
                    } else {
                        setImages(response); // Almacena las imágenes en el estado
                    }
                }

            await Promise.all([
                obtenerPais(),
                obtenerProveedor(),
                obtenerTipoEquipo(),
                obtenerModelo(),
                obtenerImagen(),
            ]);

            setLoaded(true);

        })();


    }, [equipo, sessionAPIToken]); //Cada vez que cambia el equipo

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Retorna el JSX del mensaje de vista
    if(!loaded){ //Si no han cargado los datos
        return <span><b>Cargando...</b></span>; //Muestra pagina cargando
    }
    return (
        <div className={`${styles.container}`}>
            <h2>Datos del Equipo</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Nombre</label>
                    <p className={styles.detailsValue}>{equipo.nombre}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Número de Serie</label>
                    <p className={styles.detailsValue}>{equipo.numSerie}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Fecha de Adquisición</label>
                    <p className={styles.detailsValue}>
                        {new Date(equipo.fechaAdquisicion + 'T00:00:00').toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>País de Órigen</label>
                    <p className={styles.detailsValue}>{pais}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Tipo de Equipo</label>
                    <p className={styles.detailsValue}>{tipoEquipo}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Proveedor</label>
                    <p className={styles.detailsValue}>{proveedor}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Marca</label>
                    <p className={styles.detailsValue}>{marca}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Modelo</label>
                    <p className={styles.detailsValue}>{modelo}</p>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Garantía</label>
                    <p className={styles.detailsValue}>{msgGarantia}</p>
                </div>
                <div className={styles.inputBox}>
                <div className={styles.modalCarousel}>
                    <Carousel
                        selectedItem={currentImageIndex}
                        onChange={setCurrentImageIndex}
                        showThumbs={false}
                        showStatus={false}
                        showIndicators={true}
                        dynamicHeight={true}
                    >
                        {images.map((image: ImagenDTO): ReactElement => (
                            <div key={image.id}>
                                <img src={"data:" + image.base64Content} alt={image.nombre as string}/>
                            </div>
                        ))}
                    </Carousel>
                </div>
                </div>
            </div>
        </div>
    );
};

export default ModalViewEquipoFC;
