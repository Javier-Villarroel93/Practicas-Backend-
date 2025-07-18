const citaCtl = {};
const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');
const { cifrarDatos, descifrarDatos } = require('../lib/encrypDates');

// Función para descifrar de forma segura
const descifrarSeguro = (dato) => {
    try {
        return dato ? descifrarDatos(dato) : '';
    } catch (error) {
        console.error('Error al descifrar:', error);
        return '';
    }
};

// Mostrar todas las citas con información completa
citaCtl.mostrarCitas = async (req, res) => {
    try {
        const [listaCitas] = await sql.promise().query(`
            SELECT c.*, 
                   cl.nombreCliente, cl.cedulaCliente,
                   m.nombreMascota, m.especie,
                   s.nombreServicio, s.precioServicio,
                   u.nameUsers as veterinario
            FROM citas c
            JOIN clientes cl ON c.idCliente = cl.idClientes
            JOIN mascotas m ON c.idMascota = m.idMascota
            JOIN servicios s ON c.idServicio = s.idServicio
            LEFT JOIN users u ON c.usuarioIdUser = u.idUser
            ORDER BY c.fecha DESC, c.hora DESC
        `);

        const citasCompletas = await Promise.all(
            listaCitas.map(async (cita) => {
                const citaMongo = await mongo.citaModel.findOne({ 
                    idCitaSql: cita.idCita.toString()
                });

                return {
                    ...cita,
                    cliente: {
                        nombre: descifrarSeguro(cita.nombreCliente),
                        cedula: descifrarSeguro(cita.cedulaCliente)
                    },
                    mascota: {
                        nombre: descifrarSeguro(cita.nombreMascota),
                        especie: descifrarSeguro(cita.especie)
                    },
                    servicio: {
                        nombre: descifrarSeguro(cita.nombreServicio),
                        precio: cita.precioServicio
                    },
                    veterinario: descifrarSeguro(cita.veterinario),
                    detallesMongo: citaMongo ? {
                        motivo: citaMongo.motivo,
                        sintomas: citaMongo.sintomas,
                        diagnosticoPrevio: citaMongo.diagnosticoPrevio,
                        tratamientosAnteriores: citaMongo.tratamientosAnteriores,
                        estado: citaMongo.estado,
                        notasAdicionales: citaMongo.notasAdicionales,
                        asistio: citaMongo.asistio,
                        fechaReal: citaMongo.fechaReal
                    } : null
                };
            })
        );

        return res.json(citasCompletas);
    } catch (error) {
        console.error('Error al mostrar citas:', error);
        return res.status(500).json({ message: 'Error al obtener las citas', error: error.message });
    }
};

// Crear nueva cita
citaCtl.crearCita = async (req, res) => {
    try {
        const { 
            idCliente, idMascota, idServicio, fecha, hora, usuarioIdUser,
            motivo, sintomas, diagnosticoPrevio, tratamientosAnteriores, notasAdicionales
        } = req.body;

        if (!idCliente || !idMascota || !idServicio || !fecha || !hora) {
            return res.status(400).json({ message: 'Cliente, mascota, servicio, fecha y hora son obligatorios' });
        }

        const nuevaCita = await orm.cita.create({
            idCliente: idCliente,
            idMascota: idMascota,
            idServicio: idServicio,
            fecha: fecha,
            hora: hora,
            estadoCita: 'programada',
            usuarioIdUser: usuarioIdUser || null,
            createCita: new Date().toLocaleString(),
        });

        await mongo.citaModel.create({
            idCitaSql: nuevaCita.idCita.toString(),
            idCliente: idCliente.toString(),
            idMascota: idMascota.toString(),
            motivo: motivo || '',
            sintomas: sintomas || '',
            diagnosticoPrevio: diagnosticoPrevio || '',
            tratamientosAnteriores: tratamientosAnteriores || [],
            estado: 'pendiente',
            notasAdicionales: notasAdicionales || '',
            asistio: false
        });

        return res.status(201).json({ 
            message: 'Cita creada exitosamente',
            idCita: nuevaCita.idCita
        });

    } catch (error) {
        console.error('Error al crear cita:', error);
        return res.status(500).json({ 
            message: 'Error al crear la cita', 
            error: error.message 
        });
    }
};

// Actualizar cita
citaCtl.actualizarCita = async (req, res) => {
    try {
        const { idCita } = req.params; // Suponiendo que el ID se pasa como parámetro en la URL
        const { 
            idCliente, idMascota, idServicio, fecha, hora,
            motivo, sintomas, diagnosticoPrevio, tratamientosAnteriores, notasAdicionales
        } = req.body;

        if (!idCliente || !idMascota || !idServicio || !fecha || !hora) {
            return res.status(400).json({ message: 'Cliente, mascota, servicio, fecha y hora son obligatorios' });
        }

        // Actualizar en la base de datos SQL
        await orm.cita.update({
            idCliente: idCliente,
            idMascota: idMascota,
            idServicio: idServicio,
            fecha: fecha,
            hora: hora,
            estadoCita: 'programada', // Puedes cambiar esto si es necesario
            usuarioIdUser: req.body.usuarioIdUser || null,
        }, {
            where: { idCita }
        });

        // Actualizar en la base de datos MongoDB
        await mongo.citaModel.updateOne(
            { idCitaSql: idCita },
            {
                idCliente: idCliente.toString(),
                idMascota: idMascota.toString(),
                motivo: motivo || '',
                sintomas: sintomas || '',
                diagnosticoPrevio: diagnosticoPrevio || '',
                tratamientosAnteriores: tratamientosAnteriores || [],
                notasAdicionales: notasAdicionales || '',
                asistio: false // Puedes cambiar esto si es necesario
            }
        );

        return res.json({ message: 'Cita actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar cita:', error);
        return res.status(500).json({ 
            message: 'Error al actualizar la cita', 
            error: error.message 
        });
    }
};

// Eliminar cita
citaCtl.eliminarCita = async (req, res) => {
    try {
        const { idCita } = req.params; // Suponiendo que el ID se pasa como parámetro en la URL

        // Marcar como inactivo en SQL
        await orm.cita.update({
            estadoCita: 'cancelada',
            updateCita: new Date().toLocaleString(),
        }, {
            where: { idCita }
        });

        // Marcar como inactivo en MongoDB
        await mongo.citaModel.updateOne(
            { idCitaSql: idCita },
            { estado: 'cancelada' }
        );

        return res.json({ message: 'Cita eliminada exitosamente' });

    } catch (error) {
        console.error('Error al eliminar cita:', error);
        return res.status(500).json({ 
            message: 'Error al eliminar la cita', 
            error: error.message 
        });
    }
};

module.exports = citaCtl;