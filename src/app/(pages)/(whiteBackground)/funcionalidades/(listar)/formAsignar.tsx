/*import {ChangeEvent, ReactElement, useEffect} from "react";
import {useModal} from "@/app/hooks/modals/useModal";
import styles from "@public/styles/modules/table/table.editformequipo.module.css";
import FuncionalidadDTO from "@/types/dtos/FuncionalidadDTO";
import {register} from "next/dist/client/components/react-dev-overlay/pages/client";

interface AsignarFuncionalidadesFormProps {

}

interface FormValues extends FuncionalidadDTO{

}

function AsignarFuncionalidadesForm(props: Readonly<AsignarFuncionalidadesFormProps>): ReactElement {

    // ----------------------- Modales -----------------------

    const {createModal} = useModal();

    useEffect(() => {

    }, []);


    return (
        <div className={styles.inputBox}>
            <label className={styles.details}>Perfiles</label>
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
    )

}
 */
