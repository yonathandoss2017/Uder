import React, { useState, useEffect } from "react";
import EquipoDTO from "@/types/dtos/EquipoDTO"; // Asegúrate de tener esta importación

interface AsignarEquipoFormProps {
    equipos: EquipoDTO[];
    selectedEquipoId?: number;
    onAsignarEquipo: (equipoId: number | null) => void;
}

const AsignarEquipoForm: React.FC<AsignarEquipoFormProps> = ({ equipos, selectedEquipoId, onAsignarEquipo }) => {

    const [equipoSeleccionado, setEquipoSeleccionado] = useState<number | undefined>(selectedEquipoId);

    useEffect(() => {
        if (selectedEquipoId) {
            setEquipoSeleccionado(selectedEquipoId);
        }
    }, [selectedEquipoId]);

    const handleEquipoChange = (equipoId: number) => {
        setEquipoSeleccionado(equipoId);
        onAsignarEquipo(equipoId);
    };

    return (
        <div>
            <label>Seleccione un equipo</label>
            {equipos.length > 0 ? (
                <div>
                    {equipos.map((equipo) => (
                        <div key={equipo.id}>
                            <label htmlFor={`equipo-${equipo.id}`}>{equipo.nombre}</label>
                            <input
                                type="radio"
                                id={`equipo-${equipo.id}`}
                                name="equipo"
                                checked={equipoSeleccionado === equipo.id}
                                onChange={() => handleEquipoChange(equipo.id!)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p>No hay equipos disponibles.</p>
            )}
        </div>
    );
};

export default AsignarEquipoForm;
