import React, { useState, useEffect } from "react";
import EquipoDTO from "@/types/dtos/EquipoDTO"; // Asegúrate de tener esta importación

interface AsignarEquipoFormProps {
    equipos: EquipoDTO[];
    selectedEquipoId?: number;
    onAsignarEquipo: (equipoId: number | null) => void;
}

const AsignarEquipoForm: React.FC<AsignarEquipoFormProps> = ({ equipos, selectedEquipoId, onAsignarEquipo }) => {
    const [equipoSeleccionado, setEquipoSeleccionado] = useState<number | undefined>(selectedEquipoId);
    const [paginaActual, setPaginaActual] = useState<number>(1); // Estado para la página actual
    const equiposPorPagina = 1; // Número de equipos por página

    // Actualiza el equipo seleccionado si cambia el prop `selectedEquipoId`
    useEffect(() => {
        if (selectedEquipoId) {
            setEquipoSeleccionado(selectedEquipoId);
        }
    }, [selectedEquipoId]);

    const handleEquipoChange = (equipoId: number) => {
        setEquipoSeleccionado(equipoId);
        onAsignarEquipo(equipoId);
    };

    // Calcula el rango de equipos a mostrar en la página actual
    const indiceUltimoEquipo = paginaActual * equiposPorPagina;
    const indicePrimerEquipo = indiceUltimoEquipo - equiposPorPagina;
    const equiposActuales = equipos.slice(indicePrimerEquipo, indiceUltimoEquipo); // Equipos a mostrar en la página actual

    // Maneja la navegación entre páginas
    const handleSiguiente = () => {
        if (indiceUltimoEquipo < equipos.length) {
            setPaginaActual(paginaActual + 1);
        }
    };

    const handleAnterior = () => {
        if (paginaActual > 1) {
            setPaginaActual(paginaActual - 1);
        }
    };

    return (
        <div>
            <label>Seleccione un equipo</label>
            {equipos.length > 0 ? (
                <div>
                    {equiposActuales.map((equipo) => (
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
                    {/* Botones de paginación */}
                    <div>
                        <button onClick={handleAnterior} disabled={paginaActual === 1}>
                            Anterior
                        </button>
                        <button onClick={handleSiguiente} disabled={indiceUltimoEquipo >= equipos.length}>
                            Siguiente
                        </button>
                    </div>
                </div>
            ) : (
                <p>No hay equipos disponibles.</p>
            )}
        </div>
    );
};

export default AsignarEquipoForm;
