const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const { 
    mostrarCitas, 
    crearCita, 
    actualizarCita,
    eliminarCita
} = require('../controller/cita.controller');

// Middleware de autenticación (opcional)
// const isLoggedIn = require('../lib/auth');

// Validaciones para crear cita
const validacionCrearCita = [
    body('idCliente')
        .isInt({ min: 1 })
        .withMessage('El ID del cliente debe ser un número entero positivo'),
    
    body('idMascota')
        .isInt({ min: 1 })
        .withMessage('El ID de la mascota debe ser un número entero positivo'),
    
    body('idServicio')
        .isInt({ min: 1 })
        .withMessage('El ID del servicio debe ser un número entero positivo'),
    
    body('fecha')
        .isISO8601()
        .withMessage('La fecha debe ser válida (formato ISO 8601)')
        .custom((value) => {
            const fecha = new Date(value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fecha < hoy) {
                throw new Error('La fecha no puede ser anterior a hoy');
            }
            return true;
        }),
    
    body('hora')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('La hora debe tener formato HH:MM válido'),
    
    body('usuarioIdUser')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID del usuario debe ser un número entero positivo'),
    
    // Validaciones para campos de MongoDB
    body('motivo')
        .optional()
        .isLength({ max: 255 })
        .withMessage('El motivo no puede exceder 255 caracteres'),
    
    body('sintomas')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Los síntomas no pueden exceder 500 caracteres'),
    
    body('diagnosticoPrevio')
        .optional()
        .isLength({ max: 300 })
        .withMessage('El diagnóstico previo no puede exceder 300 caracteres'),
    
    body('tratamientosAnteriores')
        .optional()
        .isArray()
        .withMessage('Los tratamientos anteriores deben ser un array'),
    
    body('notasAdicionales')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas adicionales no pueden exceder 500 caracteres')
];

// Validaciones para actualizar cita
const validacionActualizarCita = [
    param('idCita')
        .isInt({ min: 1 })
        .withMessage('El ID de la cita debe ser un número entero positivo'),
    
    ...validacionCrearCita
];

// Validación para eliminar cita
const validacionEliminarCita = [
    param('idCita')
        .isInt({ min: 1 })
        .withMessage('El ID de la cita debe ser un número entero positivo')
];

// Validación para cambiar estado de cita
const validacionCambiarEstado = [
    param('idCita')
        .isInt({ min: 1 })
        .withMessage('El ID de la cita debe ser un número entero positivo'),
    
    body('estado')
        .isIn(['programada', 'confirmada', 'cancelada', 'completada', 'no_asistio'])
        .withMessage('Estado debe ser: programada, confirmada, cancelada, completada o no_asistio'),
    
    body('observaciones')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las observaciones no pueden exceder 500 caracteres')
];

// ================ RUTAS DE CITAS ================

// Obtener todas las citas
router.get('/lista', mostrarCitas);

// Obtener citas por fecha
router.get('/fecha/:fecha', (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para obtener citas por fecha' });
});

// Obtener citas por cliente
router.get('/cliente/:idCliente', (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para obtener citas por cliente' });
});

// Obtener citas por mascota
router.get('/mascota/:idMascota', (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para obtener citas por mascota' });
});

// Obtener citas por veterinario
router.get('/veterinario/:idVeterinario', (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para obtener citas por veterinario' });
});

// Obtener citas por estado
router.get('/estado/:estado', (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para obtener citas por estado' });
});

// Obtener agenda del día
router.get('/agenda-hoy', (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para obtener agenda del día' });
});

// Obtener agenda de la semana
router.get('/agenda-semana', (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para obtener agenda de la semana' });
});

// Verificar disponibilidad de horario
router.post('/verificar-disponibilidad', (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para verificar disponibilidad de horario' });
});

// Crear nueva cita
router.post('/crear', validacionCrearCita, crearCita);

// Actualizar cita existente
router.put('/actualizar/:idCita', validacionActualizarCita, actualizarCita);

// Cambiar estado de cita
router.put('/cambiar-estado/:idCita', validacionCambiarEstado, (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para cambiar estado de cita' });
});

// Marcar asistencia
router.put('/marcar-asistencia/:idCita', (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para marcar asistencia' });
});

// Eliminar (cancelar) cita
router.delete('/eliminar/:idCita', validacionEliminarCita, eliminarCita);

// Reprogramar cita
router.put('/reprogramar/:idCita', (req, res) => {
    // Implementar en el controlador si es necesario
    res.json({ message: 'Endpoint para reprogramar cita' });
});

module.exports = router;