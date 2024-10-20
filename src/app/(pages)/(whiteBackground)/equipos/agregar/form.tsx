// =============================================================================
// Formulario de registro de usuarios (no el cliente).
// =============================================================================

"use client";  // Este es un componente del lado del cliente

// Importa los estilos de la página
import styles from "@public/styles/modules/register.equipo.module.css";
// Importa los módulos necesarios
import React, {ChangeEvent, useEffect, useState} from "react";
import {SubmitHandler, useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import FetchAPIError, {isFetchAPIError} from "@/types/errors/FetchAPIError";
import SchemaEquipo from "@/validations/SchemaEquipo";
import EquipoDTO from "@/types/dtos/EquipoDTO";
import GarantiaDTO from "@/types/dtos/GarantiaDTO";
import MarcaDTO from "@/types/dtos/MarcaDTO";
import ComboBoxFC from "@/components/ComboBoxFC";
import ModeloDTO from "@/types/dtos/ModeloDTO";
import TipoEquipoDTO from "@/types/dtos/TipoEquipoDTO";
import ProveedorDTO from "@/types/dtos/ProveedorDTO";
import UbicacionDTO from "@/types/dtos/UbicacionDTO";
import PaisDTO from "@/types/dtos/PaisDTO";
import UsuarioDTO from "@/types/dtos/UsuarioDTO";
import SchemaEquipoImagen from "@/validations/SchemaEquipoImagen";
import {agregarEquipo} from "@/services/EquiposService";
import {listarMarcas} from "@/services/MarcaService";
import {listarModelos} from "@/services/ModeloService";
import {listarTiposEquipo} from "@/services/TipoEquipoService";
import {listarProveedores} from "@/services/ProveedorService";
import {listarUbicaciones} from "@/services/UbicacionService";
import {listarPaises} from "@/services/PaisService";
import {imageToBase64} from "@/utils/Utils";
import ImagenDTO from "@/types/dtos/ImagenDTO";
import {agregarImagen} from "@/services/ImagenService";
import {useModal} from "@/app/hooks/modals/useModal";
import {ModalButtonsType} from "@/components/ModalFC";
import MarcaFilter from "@/types/filters/MarcaFilter";
import ModeloFilter from "@/types/filters/ModeloFilter";
import TipoEquipoFilter from "@/types/filters/TipoEquipoFilter";
import ProveedorFilter from "@/types/filters/ProveedorFilter";
import {useToken} from "@/app/hooks/TokenProvider";

/**
 * Propiedades del componente
 *
 * @property {string} sessionAPIToken Token de sesión del cliente en la API
 * @property {UsuarioDTO} clientData Datos del usuario cliente (Usuario que está editando)
 */
interface RegisterEquipoFormProps {
    sessionAPIToken: string;
    clientData: UsuarioDTO;
}

/**
 * Valores del formulario (Hereda los valores de EquipoDTO) con los campos adicionales
 * de la garantía (Valores individuales) y la imágen del equipo
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
const RegisterEquipoForm: React.FC<RegisterEquipoFormProps> = (props: RegisterEquipoFormProps) => {

    const { sessionAPIToken } = useToken();

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    // -------------------- Formulario de registro de equipos --------------------

    // Obtenemos los métodos y propiedades necesarios del hook useForm para el formulario
    const {
        register,               // Método para registrar los inputs del formulario
        handleSubmit,           // Método para manejar el envío del formulario
        formState: {errors}     // Propiedad que contiene los errores del formulario
    }: UseFormReturn<FormValues> = useForm<FormValues>({ // Inicializamos useForm con el tipo EquipoFormData
        resolver: zodResolver(SchemaEquipo.and(SchemaEquipoImagen)),    // Usamos zodResolver para la validación del formulario con el esquema de Zod schemaEquipo
        mode: 'all',                            // Configuramos el modo de validación a "all", lo que válida en cada cambio de valor y al salir del campo
        defaultValues: {
            garantiaAnios: 0,
            garantiaMeses: 0,
            garantiaDias: 0,
            garantiaDePorVida: false
        }
    });

    // Definimos las listas de los tipos de equipo, marcas, modelos, proveedores, ubicaciones y países de origen que se cargarán en los ComboBox
    const [tiposEquipo, setTiposEquipo]: [TipoEquipoDTO[], (value: TipoEquipoDTO[]) => void] = useState<TipoEquipoDTO[]>([]);
    const [proveedores, setProveedores]: [ProveedorDTO[], (value: ProveedorDTO[]) => void] = useState<ProveedorDTO[]>([]);
    const [ubicaciones, setUbicaciones]: [UbicacionDTO[], (value: UbicacionDTO[]) => void] = useState<UbicacionDTO[]>([]);
    const [paisesOrigen, setPaisesOrigen]: [PaisDTO[], (value: PaisDTO[]) => void] = useState<PaisDTO[]>([]);
    const [marcas, setMarcas]: [MarcaDTO[], (value: MarcaDTO[]) => void] = useState<MarcaDTO[]>([]);
    const [modelos, setModelos]: [ModeloDTO[], (value: ModeloDTO[]) => void] = useState<ModeloDTO[]>([]);
    let [modelosPorMarca, setModelosPorMarca]: [ModeloDTO[], (value: ModeloDTO[]) => void] = useState<ModeloDTO[]>([]); // Es let porque cambía según la marca seleccionada

    // Estado para almacenar la marca seleccionada
    const [selectedMarcaId, setSelectedMarcaId]: [number | undefined, (value: number | undefined) => void] = useState<number | undefined>(undefined);

    // Efecto que se ejecuta al montar el componente (Carga los datos de las listas de los ComboBox)
    useEffect((): void => {

        // Procedimiento auto-ejecutable (Para que sea asíncrono)
        (async (): Promise<void> => {

            if (sessionAPIToken == null){
                return;
            }

            // ------------------- Cargar marcas -------------------
            const filtroMarca:MarcaFilter = {}
            filtroMarca.activo = true;
            setMarcas(await listarMarcas(sessionAPIToken).then((response: MarcaDTO[] | FetchAPIError): MarcaDTO[] => {
                if (isFetchAPIError(response)) return [];
                return response;
            }));

            // ------------------- Cargar modelos -------------------
            const filtroModelo: ModeloFilter = {};
            filtroModelo.activo = true;
            setModelos(await listarModelos(sessionAPIToken).then((response: ModeloDTO[] | FetchAPIError): ModeloDTO[] => {
                if (isFetchAPIError(response)) return [];
                return response;
            }));

            // ------------------- Cargar tipos de equipo -------------------
            const filtroTipoEquipo: TipoEquipoFilter = {};
            filtroTipoEquipo.activo = true;
            setTiposEquipo(await listarTiposEquipo(sessionAPIToken).then((response: TipoEquipoDTO[] | FetchAPIError): TipoEquipoDTO[] => {
                if (isFetchAPIError(response)) return [];
                return response;
            }));

            // ------------------- Cargar proveedores -------------------
            const filtroProveedores: ProveedorFilter = {}
            filtroProveedores.activo = true;
            setProveedores(await listarProveedores(sessionAPIToken).then((response: ProveedorDTO[] | FetchAPIError): ProveedorDTO[] => {
                if (isFetchAPIError(response)) return [];
                return response;
            }));

            // ------------------- Cargar ubicaciones -------------------

            setUbicaciones(
                await listarUbicaciones(
                    sessionAPIToken, 0, 1, "id", true, {activo: true}
                ).then((response: UbicacionDTO[] | FetchAPIError): UbicacionDTO[] => {
                    if (isFetchAPIError(response)) {
                        console.error("Error al obtener las ubicaciones: ", response);
                        return [];
                    }
                    return response;
                }));

            // ------------------- Cargar países de origen -------------------

            setPaisesOrigen(await listarPaises(sessionAPIToken).then((response: PaisDTO[] | FetchAPIError): PaisDTO[] => {
                if (isFetchAPIError(response)) return [];
                return response;
            }));

        })();

    }, [props.sessionAPIToken]); // Se ejecuta solo al montar el componente o si cambia el sessionAPIToken


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

    }, [selectedMarcaId, modelos]); // Se ejecuta al montar el componente y cuando cambia selectedMarcaId o modelos


    // Función que se ejecuta al enviar el formulario
    const onSubmit: SubmitHandler<FormValues> = async (formValues: FormValues): Promise<void> => {

        if (sessionAPIToken == null){
            return;
        }

        // Se crea un nuevo objeto GarantiaDTO con los valores de garantía del formulario
        const nuevoGarantiaDTO: GarantiaDTO = {
            anios: formValues.garantiaAnios,
            meses: formValues.garantiaMeses,
            dias: formValues.garantiaDias,
            dePorVida: formValues.garantiaDePorVida,
        }

        // Se crea un nuevo objeto EquipoDTO con los valores del formulario
        const nuevoEquipoDTO: EquipoDTO = {
            nombre: formValues.nombre,
            idTipoEquipo: formValues.idTipoEquipo,
            idModelo: formValues.idModelo,
            numSerie: formValues.numSerie,
            idPaisOrigen: formValues.idPaisOrigen,
            idProveedor: formValues.idProveedor,
            fechaAdquisicion: formValues.fechaAdquisicion,
            garantia: nuevoGarantiaDTO,
            idUbicacionActual: formValues.idUbicacionActual,
            fechaExpiracionGarantia: formValues.fechaExpiracionGarantia,
        };

        // Se obtiene la imagen del formulario
        const imagenFile: File = formValues.imagen.item(0) as File;

        // Se registra el equipo en la API
        const response: EquipoDTO | FetchAPIError = await agregarEquipo(nuevoEquipoDTO, sessionAPIToken);

        // Se verifica si hay un error en la respuesta
        if (isFetchAPIError(response)) {
            // Si ocurre un error al registrar el equipo se muestra un mensaje de error
            console.error('ERROR - Registro de equipo - agregarEquipo:', response);
            createModal({
                children: (
                    <div>
                        <h2>Error al registrar el equipo</h2>
                        <p>{response.errorMessage}</p>
                    </div>
                ),
                buttonsType: ModalButtonsType.CONFIRM
            }).show();
            return;
        }

        // Si se registra correctamente, ahora se registra la imagen del equipo

        // Se obtiene el contenido base64 de la imagen
        const base64content: string = await imageToBase64(imagenFile);

        // Se crea un nuevo objeto ImagenDTO con los valores de la imagen del formulario
        const imagenDTO: ImagenDTO = {
            base64Content: base64content,
            idEquipo: response.id as number,
            tipoImagen: imagenFile.type.split('/')[1] // Se obtiene el tipo de imagen (png, jpg, jpeg)
        };

        // Se registra la imagen en la API
        await agregarImagen(imagenDTO, sessionAPIToken).then((response: void | FetchAPIError): void => {
            if (isFetchAPIError(response)) {
                // Si ocurre un error al registrar la imagen se muestra un mensaje de error
                createModal({
                    children: (
                        <div>
                            <h2>Error al registrar la imagen</h2>
                            <p>{response.errorMessage}</p>
                        </div>
                    ),
                    buttonsType: ModalButtonsType.CONFIRM
                }).show();
                console.error('ERROR - Registro de equipo - agregarImagen:', response);
            }
        });

        // Se muestra un mensaje de éxito
        createModal({
            children: (
                <div>
                    <h2>Equipo registrado correctamente</h2>
                </div>
            ),
            buttonsType: ModalButtonsType.CONFIRM
        }).show();
    };

    // ------------------------------------------------------------------------

    // Retorna el JSX del componente (Formulario de registro de equipo)
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.equipoForm}>
            <h2>Registro de Equipo</h2>
            <div className={styles.userDetailsRe}>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Nombre <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("nombre", {required: "Este campo es requerido"})}
                            type="text"
                            placeholder="Nombre del Equipo"
                        />
                    </label>

                    {errors.nombre &&
                        <label className={styles.error}>{errors.nombre.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Tipo <span className={styles.requiredField}>*</span></span>

                        <ComboBoxFC
                            message={"Seleccione un tipo de equipo"}
                            register={register("idTipoEquipo")}
                            elements={tiposEquipo.map((tipoEquipo: TipoEquipoDTO): { key: number, value: string } => ({
                                key: tipoEquipo.id as number,
                                value: tipoEquipo.nombre
                            }))}
                        />
                    </label>

                    {errors.idTipoEquipo &&
                        <label className={styles.error}>{errors.idTipoEquipo.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Marca <span className={styles.requiredField}>*</span></span>

                        <ComboBoxFC
                            message={"Seleccione una marca"}
                            elements={marcas.map((marca: MarcaDTO): { key: number, value: string } => ({
                                key: marca.id as number,
                                value: marca.nombre
                            }))}
                            selectedKey={selectedMarcaId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMarcaId(parseInt(e.target.value))}
                        />
                    </label>

                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Modelo <span className={styles.requiredField}>*</span></span>

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
                                />
                            )
                            :
                            (
                                <select disabled>
                                    <option value="">Seleccione una marca</option>
                                </select>
                            )
                        }
                    </label>

                    {errors.idModelo &&
                        <label className={styles.error}>{errors.idModelo.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Número de Serie <span className={styles.requiredField}>*</span></span>

                        <input
                            {...register("numSerie", {required: "Este campo es requerido"})}
                            type="text"
                            placeholder="Número de Serie"
                        />
                    </label>

                    {errors.numSerie &&
                        <label className={styles.error}>{errors.numSerie.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <span className={styles.details}>Garantía</span>
                    <div className={styles.gInputRe}>
                        <div>
                            <label htmlFor="garantiaAnios">
                                <span>Años</span>
                                <input className={styles.fechaInput} id="garantiaAnios" type="number" {...register('garantiaAnios')} defaultValue={0}
                                       min={0} max={20}/>
                            </label>
                        </div>
                        <div>
                            <label htmlFor="garantiaMeses">
                                <span>Meses</span>
                                <input className={styles.fechaInput} id="garantiaMeses" type="number" {...register('garantiaMeses')} defaultValue={0}
                                       min={0} max={12}/>
                            </label>

                        </div>
                        <div>
                            <label htmlFor="garantiaDias">
                                <span>Días</span>
                                <input className={styles.fechaInput}  id="garantiaDias" type="number" {...register('garantiaDias')} defaultValue={0}
                                       min={0} max={31}/>
                            </label>

                        </div>
                        <div>
                            <label className={styles.deporvida} htmlFor="garantiaDePorVida">
                                <span>De por vida</span>
                                <input id="garantiaDePorVida" {...register('garantiaDePorVida')}
                                       type="checkbox"/>
                            </label>

                        </div>

                        {errors.garantiaAnios &&
                            <label className={styles.error}>{errors.garantiaAnios.message}</label>}
                        {errors.garantiaMeses &&
                            <label className={styles.error}>{errors.garantiaMeses.message}</label>}
                        {errors.garantiaDias &&
                            <label className={styles.error}>{errors.garantiaDias.message}</label>}
                    </div>
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>País de Origen <span className={styles.requiredField}>*</span></span>

                        <ComboBoxFC
                            message={"Seleccione un país"}
                            register={register("idPaisOrigen")}
                            elements={paisesOrigen.map((pais: PaisDTO): { key: number, value: string } => ({
                                key: pais.id as number,
                                value: pais.nombre
                            }))}
                        />
                    </label>

                    {errors.idPaisOrigen &&
                        <label className={styles.error}>{errors.idPaisOrigen.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Proveedor<span className={styles.requiredField}>*</span></span>

                        <ComboBoxFC
                            message={"Seleccione un proveedor"}
                            register={register("idProveedor")}
                            elements={proveedores.map((proveedor: ProveedorDTO): { key: number, value: string } => ({
                                key: proveedor.id as number,
                                value: proveedor.nombre
                            }))}
                        />
                    </label>

                    {errors.idProveedor &&
                        <label className={styles.error}>{errors.idProveedor.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Ubicación <span className={styles.requiredField}>*</span></span>

                        <ComboBoxFC
                            message={"Seleccione una ubicación"}
                            register={register("idUbicacionActual")}
                            elements={ubicaciones.map((ubicacion: UbicacionDTO): { key: number, value: string } => ({
                                key: ubicacion.id as number,
                                value: ubicacion.nombre
                            }))}
                        />
                    </label>

                    {errors.idUbicacionActual &&
                        <label className={styles.error}>{errors.idUbicacionActual.message}</label>}
                </div>
                <div className={styles.inputBoxRe}>
                    <label className={styles.details}>
                        <span>Fecha de Adquisición <span className={styles.requiredField}>*</span></span>
                        <input
                            {...register("fechaAdquisicion", {required: "Este campo es requerido"})}
                            type="date"
                            defaultValue={new Date().toISOString().split('T')[0]}
                        />
                    </label>

                    {errors.fechaAdquisicion &&
                        <label className={styles.error}>{errors.fechaAdquisicion.message}</label>}
                </div>
                <div className={styles.ultimobtnRe}>
                    <div className={styles.sImagen}>
                        <div>
                            <label className={styles.imagen} htmlFor="imagen">
                                <span>Imagen</span>
                                <input id="imagen" type="file" {...register('imagen')}
                                       onChange={(event: ChangeEvent<HTMLInputElement>) => previewImage(event, '#imgPreview')}/>
                            </label>

                        </div>
                        <div className={styles.preview}>
                            <img id="imgPreview" src="" alt=""></img>
                        </div>
                    </div>
                    {errors.imagen &&
                        <label className={styles.error}>{errors.imagen.message}</label>}
                </div>
            </div>
            <div className={styles.buttomAe}>
                <button type="submit">Guardar</button>
            </div>
        </form>

    );
};

// Exporta el componente
export default RegisterEquipoForm;


// --------------------------> Funciones auxiliares <--------------------------

/**
 * Muestra la vista previa de la imagen seleccionada en un elemento HTMLImageElement (img)
 * @param event Evento de cambio del input file
 * @param querySelector Selector del elemento HTMLImageElement donde se mostrará la vista previa
 */
function previewImage(event: React.ChangeEvent<HTMLInputElement>, querySelector: string): void {
    const input: HTMLInputElement = event.target;
    const imgPreview: HTMLImageElement | null = document.querySelector(querySelector);

    if (!input.files?.length || !imgPreview) return;

    const file: File = input.files[0];
    imgPreview.src = URL.createObjectURL(file);
}
