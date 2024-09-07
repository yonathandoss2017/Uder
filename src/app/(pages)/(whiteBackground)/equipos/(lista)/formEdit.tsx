"use client";  // Este es un componente del lado del cliente
// import "@public/styles/equipo/equipoList.css"
// import "@public/styles/equipo/equipo.css"
// Importa los módulos necesarios
import React, {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import SchemaEquipo from "@/validations/SchemaEquipo";
import EquipoDTO from "@/types/dtos/EquipoDTO";
import ModeloDTO from "@/types/dtos/ModeloDTO";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import UbicacionDTO from "@/types/dtos/UbicacionDTO";
import PaisDTO from "@/types/dtos/PaisDTO";
import ComboBoxFC from "@/components/ComboBoxFC";
import ChangeEntry from "@/types/ChangeEntry";
import {Carousel} from "react-responsive-carousel";
import ImagenDTO from "@/types/dtos/ImagenDTO";
import {listarMarcas} from "@/services/MarcaService";
import {listarModelos} from "@/services/ModeloService";
import {listarTiposEquipo} from "@/services/TipoEquipoService";
import {listarProveedores} from "@/services/ProveedorService";
import {listarUbicaciones} from "@/services/UbicacionService";
import {listarPaises} from "@/services/PaisService";
import {agregarImagen, eliminarImagen, listarImagenes} from "@/services/ImagenService";
import {z} from "zod";
import GarantiaDTO from "@/types/dtos/GarantiaDTO";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";
import ModalChangesFC from "@/components/ModalChangesFC";
import {modificarEquipo} from "@/services/EquiposService";
import {imageToBase64} from "@/utils/Utils";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import LoadingPage from "@/app/(pages)/loading";

/**
 * Propiedades del componente
 * @property {string} sessionAPIToken Token de sesión del cliente en la API
 * @property {EquipoDTO} editingEquipo Equipo a editar (Se va actualizando con los cambios onChange)
 * @property {function} onSave Evento que maneja la acción de guardar los cambios
 * @property {function} onCancel Evento que maneja la acción de cancelar la edición
 */
interface EditEquipoFormProps {
    sessionAPIToken: string;
    idInstitucion: number;
    editingEquipo: EquipoDTO;
    onSave?: (equipoModified: EquipoDTO) => void;
    onCancel?: () => void;
}

/**
 * Valores del formulario (Hereda los valores de EquipoDTO) con los campos adicionales
 * de la garantía (Valores individuales)
 *
 * @property {string} contrasenia - Contraseña del usuario
 * @property {string} telefono - Teléfono del usuario
 */
interface FormValues extends EquipoDTO {
    garantiaAnios: number;
    garantiaMeses: number;
    garantiaDias: number;
    garantiaDePorVida: boolean;
    imagen: FileList;
}

/**
 * Formulario de registro de equipo
 *
 * @param {RegisterEquipoFormProps} props - Propiedades del componente
 */
function EditEquipoForm(props: Readonly<EditEquipoFormProps>): ReactElement {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // -------------------- Formulario de modificación de equipo --------------------
    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: {errors}     // Propiedad que contiene los errores del formulario
    }: UseFormReturn<FormValues> = useForm<FormValues>({ // Inicializamos useForm con el tipo EquipoFormData
        resolver: zodResolver(SchemaEquipo.merge(
            z.object({
                imagen: z.any().optional()
            })
        )),    // Usamos zodResolver para la validación del formulario con el esquema de Zod SchemaEquipo
        mode: 'all',                            // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
        defaultValues: {                        // Valores iniciales del formulario
            ...props.editingEquipo, // Copia los valores del equipo a editar

            // Valores iniciales de la garantía
            garantiaAnios: props.editingEquipo.garantia.anios,
            garantiaMeses: props.editingEquipo.garantia.meses,
            garantiaDias: props.editingEquipo.garantia.dias,
            garantiaDePorVida: props.editingEquipo.garantia.dePorVida,
        }
    });

    //Bandera de cargando
    const [loaded, setLoaded]: [boolean,(value: boolean) => void] = useState<boolean>(false);

    // Definimos las listas de los tipos de equipo, marcas, modelos, proveedores, ubicaciones y países de origen que se cargarán en los ComboBox
    const [tiposEquipo, setTiposEquipo]: [TipoEquipoDTO[], (value: TipoEquipoDTO[]) => void] = useState<TipoEquipoDTO[]>([]);
    const [proveedores, setProveedores]: [ProveedorDTO[], (value: ProveedorDTO[]) => void] = useState<ProveedorDTO[]>([]);
    const [ubicaciones, setUbicaciones]: [UbicacionDTO[], (value: UbicacionDTO[]) => void] = useState<UbicacionDTO[]>([]);
    const [paisesOrigen, setPaisesOrigen]: [PaisDTO[], (value: PaisDTO[]) => void] = useState<PaisDTO[]>([]);
    const [marcas, setMarcas]: [MarcaDTO[], (value: MarcaDTO[]) => void] = useState<MarcaDTO[]>([]);
    const [modelos, setModelos]: [ModeloDTO[], (value: ModeloDTO[]) => void] = useState<ModeloDTO[]>([]);


    // Estado para almacenar la marca seleccionada
    const [selectedMarcaId, setSelectedMarcaId]: [number | undefined, (value: number | undefined) => void] = useState<number | undefined>(undefined);

    // Estado para almacenar los modelos de la marca seleccionada (Se actualiza al cambiar la marca seleccionada)
    let [modelosPorMarca, setModelosPorMarca]: [ModeloDTO[], (value: ModeloDTO[]) => void] = useState<ModeloDTO[]>([]); // Es let porque cambía según la marca seleccionada

    // Estado para almacenar el índice de la imagen actual (Para el carrusel)
    const [currentImageIndex, setCurrentImageIndex]: [number, (value: number) => void] = useState(0);

    // Estado para almacenar las imágenes a eliminar (Para el carrusel y eliminarlas al guardar cambios)
    const [imagesToDelete, setImagesToDelete]: [ImagenDTO[], (value: ImagenDTO[]) => void] = useState<ImagenDTO[]>([]);

    // Estado para almacenar las imágenes del equipo (Para el carrusel)
    let [images, setImages]: [ImagenDTO[], (value: ImagenDTO[]) => void] = useState<ImagenDTO[]>([]);

    // Efecto que se ejecuta al montar el componente y cuando cambia el equipo a editar
    // - Carga las imágenes del equipo
    useEffect((): void => {

        // Procedimiento auto-ejecutable (Para que sea asíncrono)
        (async (): Promise<void> => {
            // Obtiene las imágenes del equipo desde la API
            await listarImagenes(props.editingEquipo.id as number).then((response: ImagenDTO[] | FetchAPIError): void => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - Modificar Equipo - listarImagenes: ", response);
                    setImages([]); // Limpia la lista de imágenes
                    return;
                }
                setImages(response); // Almacena las imágenes en el estado
            });
        })();
    }, [props.editingEquipo]); // Se ejecuta al montar el componente y cuando cambia el equipo a editar


    // Efecto que se ejecuta al montar el componente (Carga los datos de las listas de los ComboBox)
    useEffect((): void => {

        // Procedimiento auto-ejecutable (Para que sea asíncrono)
        (async (): Promise<void> => {

            // ------------------- Cargar marcas -------------------

            setMarcas(await listarMarcas(props.sessionAPIToken).then((response: MarcaDTO[] | FetchAPIError): MarcaDTO[] => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - Modificar Equipo - listarMarcas: ", response);
                    return [];
                }
                return response;
            }));

            // ------------------- Cargar modelos -------------------

            setModelos(await listarModelos(props.idInstitucion).then((response: ModeloDTO[] | FetchAPIError): ModeloDTO[] => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - Modificar Equipo - listarModelos: ", response);
                    return [];
                }

                if (props.editingEquipo.idModelo) {
                    setSelectedMarcaId(response.filter((modelo: ModeloDTO): boolean => modelo.id === props.editingEquipo.idModelo)[0].idMarca);
                }

                return response;
            }));

            // ------------------- Cargar tipos de equipo -------------------

            setTiposEquipo(await listarTiposEquipo(props.sessionAPIToken).then((response: TipoEquipoDTO[] | FetchAPIError): TipoEquipoDTO[] => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - Modificar Equipo - listarTiposEquipo: ", response);
                    return [];
                }
                return response;
            }));

            // ------------------- Cargar proveedores -------------------

            setProveedores(await listarProveedores(props.sessionAPIToken).then((response: ProveedorDTO[] | FetchAPIError): ProveedorDTO[] => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - Modificar Equipo - listarProveedores: ", response);
                    return [];
                }
                return response;
            }));

            // ------------------- Cargar ubicaciones -------------------

            setUbicaciones(await listarUbicaciones(
                props.sessionAPIToken, 0, 1, "id", true, {activo: true}).then((response: UbicacionDTO[] | FetchAPIError): UbicacionDTO[] => {
                if (isFetchAPIError(response)) {
                    console.error('Error al obtener las ubicaciones:', response);
                    return [];
                }
                return response;
            }));

            // ------------------- Cargar países de origen -------------------

            setPaisesOrigen(await listarPaises(props.idInstitucion).then((response: PaisDTO[] | FetchAPIError): PaisDTO[] => {
                if (isFetchAPIError(response)) {
                    console.error("ERROR - Modificar Equipo - listarPaises: ", response);
                    return [];
                }
                return response;
            }));

            setLoaded(true);

        })();

    }, [props.sessionAPIToken, props.editingEquipo.idModelo]); // Se ejecuta solo al montar el componente o si cambia el sessionAPIToken


    // Efecto que se ejecuta al cambiar la marca seleccionada (Carga los modelos de la marca seleccionada)
    useEffect((): void => {

        // Procedimiento auto-ejecutable (Para que sea asíncrono)
        (async (): Promise<void> => {

            // Si se ha seleccionado una marca se cargan los modelos de la marca seleccionada
            if (selectedMarcaId) {

                // Filtra por idMarca
                setModelosPorMarca(modelos.filter((modelo: ModeloDTO): boolean => modelo.idMarca === selectedMarcaId));

            } else { // Si no, se limpia la lista de modelos
                setModelosPorMarca([]);
            }
        })();

    }, [modelos, selectedMarcaId]); // Se ejecuta al montar el componente y cuando cambia selectedMarcaId o la lista de modelos


    // ----------------------- Eventos del formulario de edición de equipo -----------------------

    // Procedimiento que se ejecuta al hacer clic en el botón 'Guardar'
    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {
        // Crea un objeto GarantiaDTO con los valores de la garantía actualizados
        const nuevoGarantiaDTO: GarantiaDTO = {
            anios: formValues.garantiaAnios,
            meses: formValues.garantiaMeses,
            dias: formValues.garantiaDias,
            dePorVida: formValues.garantiaDePorVida,
        };

        // Obtiene la imagen a añadir (Si no hay imagen, se asigna undefined)
        const imageToAdd: undefined | File | null = formValues.imagen ? formValues.imagen.item(0) : undefined;

        const modifiedEquipo: EquipoDTO = {
            ...props.editingEquipo, // Copia los valores originales del equipo
            // Copia los valores del formulario
            nombre: formValues.nombre,
            idTipoEquipo: formValues.idTipoEquipo,
            idModelo: formValues.idModelo,
            numSerie: formValues.numSerie,
            idPaisOrigen: formValues.idPaisOrigen,
            idProveedor: formValues.idProveedor,
            idUbicacionActual: formValues.idUbicacionActual,
            fechaAdquisicion: formValues.fechaAdquisicion,
            garantia: nuevoGarantiaDTO
        };

        // Obtiene los cambios realizados
        const changes: ChangeEntry[] = await obtenerCambios(
            modifiedEquipo,
            props.editingEquipo,
            tiposEquipo,
            proveedores,
            ubicaciones,
            paisesOrigen,
            marcas, modelos,
            imageToAdd,
            imagesToDelete
        );

        if (changes.length === 0) {
            createModal({
                children: (
                    <p>No se realizaron cambios</p>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        // Muestra un mensaje de confirmación antes de modificar y guarda la respuesta
        createModal({
            title: "Modificando equipo con número de serie \"" + props.editingEquipo.numSerie + "\"",
            children: ModalChangesFC(changes),
            async onConfirm(): Promise<void> {
                // Realiza la modificación del equipo en la API
                const response: void | FetchAPIError = await modificarEquipo(modifiedEquipo, props.sessionAPIToken);

                if (isFetchAPIError(response)) {
                    createModal({
                        children: (
                            <p>Error al modificar el equipo: {response.errorMessage}</p>
                        ),
                        buttonsType: ModalButtonsType.CONFIRM
                    }).show();
                    console.error('ERROR - Modificar Equipo - table.tsx - handleSave - modificarEquipo', response);
                    return;
                }

                for (const imagen of imagesToDelete) {
                    await eliminarImagen(imagen.id as number, props.sessionAPIToken).catch((error: FetchAPIError): void => {
                        console.error("ERROR - Modificar Equipo - table.tsx - handleSave - eliminarImagen", error);
                    });
                }

                if (imageToAdd) {
                    const base64content: string = await imageToBase64(imageToAdd);
                    const imagenDTO: ImagenDTO = {
                        base64Content: base64content,
                        idEquipo: props.editingEquipo.id as number,
                        tipoImagen: imageToAdd.type.split('/')[1]
                    };

                    await agregarImagen(imagenDTO, props.sessionAPIToken).then((response: void | FetchAPIError): void => {
                        if (isFetchAPIError(response)) {
                            console.error("ERROR - Modificar Equipo - table.tsx - handleSave - agregarImagen", response);
                            createModal({
                                children: (
                                    <p>Error al agregar la imagen: {response.errorMessage}</p>
                                ),
                                buttonsType: ModalButtonsType.CONFIRM
                            }).show();
                        }
                    });
                }

                // Muestra un mensaje de éxito al modificar el equipo
                createModal({
                    children: (
                        <p>Equipo con número de serie: &quot;{props.editingEquipo.numSerie}&quot; modificado
                            correctamente</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();

                if (props.onSave) {
                    props.onSave(modifiedEquipo);
                }
            },
            onCancel(): void {
                createModal({
                    children: (
                        <p>Motivo: Modificación cancelada</p>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
            }
        }).show();
    };

    // Procedimiento que se ejecuta al hacer clic en el botón 'Eliminar imagen seleccionada'
    function handleDeleteImageSelected(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault(); // Evita que se envíe el formulario

        // Previene que se elimine la última imagen
        if (images.length <= 1) {
            createModal({
                children: (
                    <div>
                        <h2>¡Error!</h2>
                        <p>No se puede eliminar la última imagen</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        // Crea una copia de las imágenes a eliminar (lista auxiliar);
        const imagesToDeleteAux: ImagenDTO[] = imagesToDelete;

        // Añade la imagen actual a la lista de imágenes a eliminar (lista auxiliar)
        if (images[currentImageIndex].id) {
            imagesToDeleteAux.push(images[currentImageIndex]);
        }

        // Actualiza la lista de imágenes a eliminar
        setImagesToDelete(imagesToDeleteAux);

        // Crea una copia de las imágenes (lista auxiliar)
        const imagesAux: ImagenDTO[] = images;

        // Elimina la imagen actual de la lista de imágenes
        imagesAux.splice(currentImageIndex, 1);

        // Actualiza la lista de imágenes
        setImages(imagesAux);

        // Si se eliminó la última imagen, se selecciona la anterior
        if (currentImageIndex == imagesAux.length - 1) {
            // Obtiene el botón de ir a la imagen anterior
            let btn_prev: Element | null = document.querySelector('.control-prev');

            // Verifica si botón no es null y si es un elemento HTMLElement
            if (btn_prev instanceof HTMLElement) {
                btn_prev.click(); // Simula un clic en el botón de ir a la imagen anterior (Para que se actualice el carrusel)
            } else {
                // Muestra un mensaje de error en la consola si no se encontró el botón
                console.error("ERROR - Modificar Equipo - No se encontró ningún elemento con la clase .control-prev");
            }
        } else { // Si se eliminó una imagen que no era la última se selecciona la siguiente
            // Obtiene el botón de ir a la imagen siguiente
            let btn_next: Element | null = document.querySelector('.control-next');

            // Verifica si botón no es null y si es un elemento HTMLElement
            if (btn_next instanceof HTMLElement) {
                btn_next.click(); // Simula un clic en el botón de ir a la imagen siguiente (Para que se actualice el carrusel)
            } else {
                // Muestra un mensaje de error en la consola si no se encontró el botón
                console.error("ERROR - Modificar Equipo - No se encontró ningún elemento con la clase .control-next");
            }
        }

        // Actualiza el índice de la imagen actual
        if (currentImageIndex >= imagesAux.length) {
            setCurrentImageIndex(imagesAux.length - 1);
        }

    }

    // ------------------------------------------------------------------------

    // Retorna el formulario
    if(!loaded){ //Si no han cargado los datos
        return <span><b>Cargando...</b></span>; //Muestra pagina cargando
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`${styles.formContainer} ${styles.aparecer}`}>
            <h2>Modificacion de Equipo</h2>
            <div className={styles.detailsContainer}>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Nombre<span className={styles.requiredField}>*</span></label>
                    <input
                        {...register("nombre", {required: "Este campo es requerido"})}
                        type="text"
                        placeholder="Nombre del Equipo"
                        className="nombre"
                        defaultValue={props.editingEquipo.nombre}
                    />
                    {errors.nombre &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.nombre.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Tipo<span  className={styles.requiredField}>*</span></label>
                    <ComboBoxFC
                        message={"Seleccione un tipo de equipo"}
                        register={register("idTipoEquipo")}
                        elements={tiposEquipo.map((tipoEquipo: TipoEquipoDTO): { key: number, value: string } => ({
                            key: tipoEquipo.id as number,
                            value: tipoEquipo.nombre
                        }))}
                        selectedKey={props.editingEquipo.idTipoEquipo}
                    />
                    {errors.idTipoEquipo &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.idTipoEquipo.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Marca<span className={styles.requiredField}>*</span></label>
                    <ComboBoxFC
                        message={"Seleccione una marca"}
                        elements={marcas.map((marca: MarcaDTO): { key: number, value: string } => ({
                            key: marca.id as number,
                            value: marca.nombre
                        }))}
                        selectedKey={selectedMarcaId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMarcaId(parseInt(e.target.value))}
                    />
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Modelo<span className={styles.requiredField}>*</span></label>
                    {selectedMarcaId ?
                        (
                            <ComboBoxFC
                                message={"Seleccione un modelo"}
                                register={register("idModelo")}
                                elements={modelosPorMarca.map((modelo: ModeloDTO): {
                                    key: number,
                                    value: string
                                } => ({
                                    key: modelo.id as number,
                                    value: modelo.nombre
                                }))}
                                selectedKey={props.editingEquipo.idModelo}
                            />
                        )
                        :
                        (
                            <select disabled>
                                <option value="">Seleccione una marca</option>
                            </select>
                        )
                    }
                    {errors.idModelo &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.idModelo.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Número de Serie<span className={styles.requiredField}>*</span></label>
                    <input
                        {...register("numSerie", {required: "Este campo es requerido"})}
                        type="text"
                        placeholder="Número de Serie"
                        className="serie"
                        defaultValue={props.editingEquipo.numSerie}
                    />
                    {errors.numSerie &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.numSerie.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Garantía</label>
                    <div className={styles.garantiaContainer}>
                        <div>
                            <label htmlFor="garantiaAnios">Años</label>
                            <input id="garantiaAnios" type="number" {...register('garantiaAnios')}
                                   onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                                       props.editingEquipo.garantia.anios = parseInt(e.target.value)
                                   }}
                                   min={0} max={20}/>
                        </div>
                        <div>
                            <label htmlFor="garantiaMeses">Meses</label>
                            <input id="garantiaMeses" type="number" {...register('garantiaMeses')}
                                   onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                                       props.editingEquipo.garantia.meses = parseInt(e.target.value)
                                   }}
                                   min={0} max={12}/>
                        </div>
                        <div>
                            <label htmlFor="garantiaDias">Días</label>
                            <input id="garantiaDias" type="number" {...register('garantiaDias')}
                                   onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                                       props.editingEquipo.garantia.dias = parseInt(e.target.value)
                                   }}
                                   min={0} max={31}/>
                        </div>
                        <div>
                            <label className='deporvida' htmlFor="garantiaDePorVida">De por vida</label>
                            <input id="garantiaDePorVida"
                                   type="checkbox"
                                   {...register('garantiaDePorVida')}
                            />
                        </div>
                        {errors.garantiaAnios &&
                            <label className={styles.error} style={{color: 'red'}}>{errors.garantiaAnios.message}</label>}
                        {errors.garantiaMeses &&
                            <label className={styles.error} style={{color: 'red'}}>{errors.garantiaMeses.message}</label>}
                        {errors.garantiaDias &&
                            <label className={styles.error} style={{color: 'red'}}>{errors.garantiaDias.message}</label>}
                    </div>
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>País de Origen<span className={styles.requiredField}>*</span></label>
                    <ComboBoxFC
                        message={"Seleccione un país"}
                        register={register("idPaisOrigen")}
                        elements={paisesOrigen.map((pais: PaisDTO): { key: number, value: string } => ({
                            key: pais.id as number,
                            value: pais.nombre
                        }))}
                        selectedKey={props.editingEquipo.idPaisOrigen}
                    />
                    {errors.idPaisOrigen &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.idPaisOrigen.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Proveedor<span className={styles.requiredField}>*</span></label>
                    <ComboBoxFC
                        message={"Seleccione un proveedor"}
                        register={register("idProveedor")}
                        elements={proveedores.map((proveedor: ProveedorDTO): { key: number, value: string } => ({
                            key: proveedor.id as number,
                            value: proveedor.nombre
                        }))}
                        selectedKey={props.editingEquipo.idProveedor}
                    />
                    {errors.idProveedor &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.idProveedor.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Ubicación<span className={styles.requiredField}>*</span></label>
                    <ComboBoxFC
                        message={"Seleccione una ubicación"}
                        register={register("idUbicacionActual")}
                        elements={ubicaciones.map((ubicacion: UbicacionDTO): { key: number, value: string } => ({
                            key: ubicacion.id as number,
                            value: ubicacion.nombre
                        }))}
                        selectedKey={props.editingEquipo.idUbicacionActual}
                    />
                    {errors.idUbicacionActual &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.idUbicacionActual.message}</label>}
                </div>
                <div className={styles.inputBox}>
                    <label className={styles.details}>Fecha de Adquisición<span className="required-field">*</span></label>
                    <input
                        {...register("fechaAdquisicion", {required: "Este campo es requerido"})}
                        type="date"
                        className="f-adquisicion"
                        defaultValue={props.editingEquipo.fechaAdquisicion}
                    />
                    {errors.fechaAdquisicion &&
                        <label className={styles.error} style={{color: 'red'}}>{errors.fechaAdquisicion.message}</label>}
                </div>
            </div>
                <div className={styles.inputimg}>
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
                    <div className={styles.buttomM}>
                        <button onClick={handleDeleteImageSelected}
                        >Eliminar imagen seleccionada
                        </button>
                        <div>
                            <p>Subir imágen:</p>
                            <input  id="imagen" type="file" {...register('imagen')} accept=".jpg, .jpeg, .png"
                            />
                            {errors.imagen &&
                                <label className={styles.error} style={{color: 'red'}}>{errors.imagen.message}</label>}
                        </div>
                    </div>
                </div>

            <div className={styles.buttomM}>
                <button type="submit">Guardar</button>
                <button type="button" onClick={props.onCancel}>Cancelar</button>
            </div>
        </form>
    );
}

// Exporta el componente (Formulario de edición de equipo)
export default EditEquipoForm;


// --------------------------> Funciones auxiliares <--------------------------

/**
 * Obtiene los cambios realizados
 * @param editingEquipo Objeto con los datos del equipo editado
 * @param originalData Datos originales del equipo
 * @param tiposEquipo Lista de tipos de equipo (Para obtener el nombre)
 * @param proveedores Lista de proveedores (Para obtener el nombre)
 * @param ubicaciones Lista de ubicaciones (Para obtener el nombre)
 * @param paisesOrigen Lista de países de origen (Para obtener el nombre)
 * @param marcas Lista de marcas (Para obtener el nombre)
 * @param modelos Lista de modelos (Para obtener el nombre)
 * @param imageToAdd
 * @param imagesToDelete
 */
async function obtenerCambios(editingEquipo: EquipoDTO,
                              originalData: EquipoDTO,
                              tiposEquipo: TipoEquipoDTO[],
                              proveedores: ProveedorDTO[],
                              ubicaciones: UbicacionDTO[],
                              paisesOrigen: PaisDTO[],
                              marcas: MarcaDTO[],
                              modelos: ModeloDTO[],
                              imageToAdd: File | undefined | null,
                              imagesToDelete: ImagenDTO[]): Promise<ChangeEntry[]> {

    // Lista de cambios en la modificación del usuario
    const changes: ChangeEntry[] = [];

    // ==================================================================

    // Verifica si hay cambios en el nombre
    if (editingEquipo.nombre != originalData.nombre) {
        changes.push({
            field: "Nombre",
            previousValue: originalData.nombre,
            nextValue: editingEquipo.nombre
        });
    }

    // Verifica si hay cambios en el tipo de equipo
    if (editingEquipo.idTipoEquipo != originalData.idTipoEquipo) {
        changes.push({
            field: "Tipo de equipo",
            previousValue: tiposEquipo.filter((tipo: TipoEquipoDTO): boolean => tipo.id === originalData.idTipoEquipo)[0]?.nombre,
            nextValue: tiposEquipo.filter((tipo: TipoEquipoDTO): boolean => tipo.id === editingEquipo.idTipoEquipo)[0]?.nombre
        });
    }
    // Verifica si hay cambios en el modelo del equipo
    if (editingEquipo.idModelo != originalData.idModelo) {
        const previousModelo: ModeloDTO = modelos.filter((modelo: ModeloDTO): boolean => modelo.id === originalData.idModelo)[0];
        const nextModelo: ModeloDTO = modelos.filter((modelo: ModeloDTO): boolean => modelo.id === editingEquipo.idModelo)[0];

        changes.push({
            field: "Modelo",
            previousValue: previousModelo.nombre,
            nextValue: nextModelo.nombre
        });


        // Verifica si hay cambios en la marca del equipo
        if (modelos[editingEquipo.idModelo].idMarca != modelos[originalData.idModelo].idMarca) {
            changes.push({
                field: "Marca",
                previousValue: marcas.filter((marca: MarcaDTO): boolean => marca.id === previousModelo.idMarca)[0].nombre,
                nextValue: marcas.filter((marca: MarcaDTO): boolean => marca.id === nextModelo.idMarca)[0].nombre
            });
        }
    }

    // Verifica si hay cambios en el número de serie
    if (originalData.numSerie != editingEquipo.numSerie) {
        changes.push({
            field: "Número de serie",
            previousValue: originalData.numSerie,
            nextValue: editingEquipo.numSerie
        });
    }

    // Verifica si hay cambios en la garantía del equipo
    // Años
    if (originalData.garantia.anios != editingEquipo.garantia.anios) {
        changes.push({
            field: "Garantía - Años",
            previousValue: originalData.garantia.anios + " años",
            nextValue: editingEquipo.garantia.anios + " años"
        });
    }

    // Meses
    if (originalData.garantia.meses != editingEquipo.garantia.meses) {
        changes.push({
            field: "Garantía - Meses",
            previousValue: originalData.garantia.meses + " meses",
            nextValue: editingEquipo.garantia.meses + " meses"
        });
    }

    // Días
    if (originalData.garantia.dias != editingEquipo.garantia.dias) {
        changes.push({
            field: "Garantía - Días",
            previousValue: originalData.garantia.dias + " días",
            nextValue: editingEquipo.garantia.dias + " días"
        });
    }

    // De por vida
    if (originalData.garantia.dePorVida != editingEquipo.garantia.dePorVida) {
        changes.push({
            field: "Garantía - De por vida",
            previousValue: originalData.garantia.dePorVida ? "Sí" : "No",
            nextValue: editingEquipo.garantia.dePorVida ? "Sí" : "No"
        });
    }

    // Verifica si hay cambios en el país de origen
    if (originalData.idPaisOrigen != editingEquipo.idPaisOrigen) {
        changes.push({
            field: "País de origen",
            previousValue: paisesOrigen.filter((pais: PaisDTO): boolean => pais.id === originalData.idPaisOrigen)[0].nombre,
            nextValue: paisesOrigen.filter((pais: PaisDTO): boolean => pais.id === editingEquipo.idPaisOrigen)[0].nombre
        });
    }

    // Verifica si hay cambios en el proveedor
    if (originalData.idProveedor != editingEquipo.idProveedor) {
        changes.push({
            field: "Proveedor",
            previousValue: proveedores.filter((proveedor: ProveedorDTO): boolean => proveedor.id === originalData.idProveedor)[0].nombre,
            nextValue: proveedores.filter((proveedor: ProveedorDTO): boolean => proveedor.id === editingEquipo.idProveedor)[0].nombre
        });
    }

    // Verifica si hay cambios en la ubicación actual
    if (originalData.idUbicacionActual != editingEquipo.idUbicacionActual) {
        changes.push({
            field: "Ubicación actual",
            previousValue: ubicaciones.filter((ubicacion: UbicacionDTO): boolean => ubicacion.id === originalData.idUbicacionActual)[0].nombre,
            nextValue: ubicaciones.filter((ubicacion: UbicacionDTO): boolean => ubicacion.id === editingEquipo.idUbicacionActual)[0].nombre
        });
    }

    // Verifica si hay cambios en la fecha de adquisición
    if (originalData.fechaAdquisicion != editingEquipo.fechaAdquisicion) {
        changes.push({
            field: "Fecha de adquisición",
            previousValue: originalData.fechaAdquisicion,
            nextValue: editingEquipo.fechaAdquisicion
        });
    }

    // Verifica si hay cambios en las imágenes
    if (imagesToDelete.length > 0) {
        changes.push({
            field: "Eliminaste " + imagesToDelete.length + (imagesToDelete.length > 1 ? " imágenes" : " imagen"),
        });
    }
    if (!!imageToAdd) {
        changes.push({
            field: "Agregaste una imagen",
        });
    }

    // Retorna la lista de cambios realizados
    return changes;
}
