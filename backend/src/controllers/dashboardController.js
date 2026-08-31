import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MealPlan from '../models/MealPlan.js';
import BodyComposition from '../models/BodyComposition.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
    const nutritionistId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // 1. Patient Stats
    const totalPatients = await Patient.countDocuments({ nutritionist: nutritionistId });
    const activePatients = await Patient.countDocuments({ nutritionist: nutritionistId, isActive: true });

    // 2. Appointment Stats (Current Month)
    const totalAppointments = await Appointment.countDocuments({ nutritionist: nutritionistId });
    const thisMonthAppointments = await Appointment.countDocuments({
        nutritionist: nutritionistId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const lastMonthAppointments = await Appointment.countDocuments({
        nutritionist: nutritionistId,
        date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // 3. Today & Upcoming
    const todayAppointments = await Appointment.countDocuments({
        nutritionist: nutritionistId,
        date: { $gte: todayStart, $lt: todayEnd },
        status: 'scheduled'
    });
    const upcomingAppointments = await Appointment.countDocuments({
        nutritionist: nutritionistId,
        date: { $gte: now },
        status: 'scheduled'
    });

    // 4. Success Rate Calculation
    const completedAppointments = await Appointment.countDocuments({
        nutritionist: nutritionistId,
        status: 'completed'
    });
    const successRate = totalAppointments > 0
        ? Math.round((completedAppointments / totalAppointments) * 100)
        : 0;

    // 5. Success Rate Change (vs Last Month)
    const thisMonthCompleted = await Appointment.countDocuments({
        nutritionist: nutritionistId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'completed'
    });
    const lastMonthCompleted = await Appointment.countDocuments({
        nutritionist: nutritionistId,
        date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        status: 'completed'
    });

    const thisMonthRate = thisMonthAppointments > 0 ? (thisMonthCompleted / thisMonthAppointments) * 100 : 0;
    const lastMonthRate = lastMonthAppointments > 0 ? (lastMonthCompleted / lastMonthAppointments) * 100 : 0;
    const successRateChange = Math.round(thisMonthRate - lastMonthRate);

    // 6. Monthly Change %
    const monthlyChange = lastMonthAppointments > 0
        ? Math.round(((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100)
        : 0;

    // 7. Recent patients (limit 5)
    const recentPatients = await Patient.find({ nutritionist: nutritionistId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email status avatar'); // Select only needed fields

    // 8. Upcoming appointments details (limit 5)
    const upcomingAppointmentsList = await Appointment.find({
        nutritionist: nutritionistId,
        date: { $gte: now },
        status: 'scheduled'
    })
        .sort({ date: 1 })
        .limit(5)
        .populate('patient', 'firstName lastName');

    res.status(200).json({
        success: true,
        data: {
            stats: {
                totalPatients,
                activePatients,
                todayAppointments,
                upcomingAppointments,
                thisMonthAppointments,
                monthlyChange,
                successRate,
                successRateChange
            },
            recentPatients,
            upcomingAppointments: upcomingAppointmentsList
        }
    });
}, { message: 'Error fetching dashboard stats' });

// @desc    Evolucion del peso promedio de los pacientes (ultimas 8 semanas)
// @route   GET /api/dashboard/weight-data
// @access  Private
export const getWeightData = asyncHandler(async (req, res) => {
    const desde = new Date();
    desde.setDate(desde.getDate() - 7 * 8);

    const registros = await BodyComposition.aggregate([
        {
            $match: {
                nutritionist: new mongoose.Types.ObjectId(req.user.id),
                date: { $gte: desde },
                'measurements.weight': { $gt: 0 },
            },
        },
        {
            $group: {
                _id: { year: { $isoWeekYear: '$date' }, week: { $isoWeek: '$date' } },
                promedio: { $avg: '$measurements.weight' },
                mediciones: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    res.status(200).json({
        success: true,
        data: registros.map((r) => ({
            semana: `S${r._id.week}`,
            promedio: Math.round(r.promedio * 10) / 10,
            mediciones: r.mediciones,
        })),
    });
}, { message: 'Error al obtener la evolución de peso' });

// @desc    Prevalencia de patologias entre los pacientes (% del total)
// @route   GET /api/dashboard/pathology-data
// @access  Private
export const getPathologyData = asyncHandler(async (req, res) => {
    const nutritionistId = req.user.id;

    const totalPatients = await Patient.countDocuments({ nutritionist: nutritionistId });
    if (totalPatients === 0) {
        return res.status(200).json({ success: true, data: [] });
    }

    const patologias = await Patient.aggregate([
        { $match: { nutritionist: new mongoose.Types.ObjectId(nutritionistId) } },
        { $unwind: '$patologias' },
        { $group: { _id: '$patologias', pacientes: { $sum: 1 } } },
        { $sort: { pacientes: -1 } },
        { $limit: 8 },
    ]);

    res.status(200).json({
        success: true,
        data: patologias.map((p) => ({
            name: p._id,
            pacientes: p.pacientes,
            value: Math.round((p.pacientes / totalPatients) * 100),
        })),
    });
}, { message: 'Error al obtener la prevalencia de patologías' });

// @desc    Distribucion calorica promedio de los planes activos
// @route   GET /api/dashboard/macro-data
// @access  Private
export const getMacroData = asyncHandler(async (req, res) => {
    const planes = await MealPlan.aggregate([
        { $match: { nutritionist: new mongoose.Types.ObjectId(req.user.id) } },
        {
            $group: {
                _id: null,
                proteina: { $avg: '$nutrition.protein' },
                carbohidratos: { $avg: '$nutrition.carbohydrates' },
                grasas: { $avg: '$nutrition.fats' },
            },
        },
    ]);

    const promedio = planes[0];
    if (!promedio) {
        return res.status(200).json({ success: true, data: [] });
    }

    // Reparto energetico: 4 kcal/g en proteina y carbohidrato, 9 kcal/g en grasa.
    const kcal = {
        Proteínas: (promedio.proteina || 0) * 4,
        Carbohidratos: (promedio.carbohidratos || 0) * 4,
        Grasas: (promedio.grasas || 0) * 9,
    };
    const total = Object.values(kcal).reduce((a, b) => a + b, 0);

    if (total === 0) {
        return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({
        success: true,
        data: Object.entries(kcal).map(([name, value]) => ({
            name,
            valor: Math.round((value / total) * 100),
        })),
    });
}, { message: 'Error al obtener la distribución calórica' });

// @desc    Actividad reciente del consultorio
// @route   GET /api/dashboard/activity
// @access  Private
export const getRecentActivity = asyncHandler(async (req, res) => {
    const nutritionistId = req.user.id;

    const [pacientes, planes, citas] = await Promise.all([
        Patient.find({ nutritionist: nutritionistId })
            .sort({ createdAt: -1 }).limit(5).select('firstName lastName createdAt'),
        MealPlan.find({ nutritionist: nutritionistId })
            .sort({ createdAt: -1 }).limit(5).select('name createdAt'),
        Appointment.find({ nutritionist: nutritionistId, status: 'completed' })
            .sort({ date: -1 }).limit(5).populate('patient', 'firstName lastName'),
    ]);

    const eventos = [
        ...pacientes.map((p) => ({
            tipo: 'patient',
            msg: `Alta de paciente: ${p.firstName} ${p.lastName}`,
            fecha: p.createdAt,
        })),
        ...planes.map((p) => ({
            tipo: 'diet',
            msg: `Plan creado: ${p.name || 'Sin nombre'}`,
            fecha: p.createdAt,
        })),
        ...citas.map((c) => ({
            tipo: 'pdf',
            msg: `Consulta completada${c.patient ? `: ${c.patient.firstName} ${c.patient.lastName}` : ''}`,
            fecha: c.date,
        })),
    ]
        .filter((e) => e.fecha)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 8);

    res.status(200).json({
        success: true,
        data: eventos.map((e) => ({ tipo: e.tipo, msg: e.msg, tiempo: tiempoRelativo(e.fecha) })),
    });
}, { message: 'Error al obtener la actividad reciente' });

/** "hace 3 h", "hace 2 días" — el frontend solo pinta el texto. */
function tiempoRelativo(fecha) {
    const minutos = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
    if (minutos < 1) return 'hace un momento';
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    const meses = Math.floor(dias / 30);
    return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

// @desc    Estadísticas poblacionales de los pacientes del nutriólogo
// @route   GET /api/dashboard/population
// @access  Private
export const getPopulationStats = asyncHandler(async (req, res) => {
    const nutritionistId = new mongoose.Types.ObjectId(req.user.id);

    const [total, activos, imcDocs, patologias, evolucion] = await Promise.all([
        Patient.countDocuments({ nutritionist: nutritionistId }),
        Patient.countDocuments({ nutritionist: nutritionistId, isActive: true }),
        // El IMC vive en dos sitios según cómo se capturó: el snapshot del
        // paciente y el registro de composición corporal. Se toma el del
        // paciente, que es el vigente.
        Patient.find({ nutritionist: nutritionistId, 'anthropometry.bmi': { $gt: 0 } }).select('anthropometry.bmi'),
        Patient.aggregate([
            { $match: { nutritionist: nutritionistId } },
            { $unwind: '$patologias' },
            { $group: { _id: '$patologias', pacientes: { $sum: 1 } } },
            { $sort: { pacientes: -1 } },
            { $limit: 10 },
        ]),
        BodyComposition.aggregate([
            { $match: { nutritionist: nutritionistId, 'measurements.weight': { $gt: 0 } } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    pesoPromedio: { $avg: '$measurements.weight' },
                    imcPromedio: { $avg: '$measurements.bmi' },
                    mediciones: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 },
        ]),
    ]);

    // Clasificación OMS, la misma que usa frontend/src/lib/calculations/imc.js.
    const RANGOS = [
        { categoria: 'Bajo peso', max: 18.5 },
        { categoria: 'Normal', max: 25 },
        { categoria: 'Sobrepeso', max: 30 },
        { categoria: 'Obesidad I', max: 35 },
        { categoria: 'Obesidad II', max: 40 },
        { categoria: 'Obesidad III', max: Infinity },
    ];

    const distribucionIMC = RANGOS.map((r) => ({ categoria: r.categoria, pacientes: 0 }));
    let sumaIMC = 0;

    for (const doc of imcDocs) {
        const bmi = doc.anthropometry.bmi;
        sumaIMC += bmi;
        const i = RANGOS.findIndex((r) => bmi < r.max);
        distribucionIMC[i === -1 ? RANGOS.length - 1 : i].pacientes += 1;
    }

    res.status(200).json({
        success: true,
        data: {
            total,
            activos,
            conImc: imcDocs.length,
            imcPromedio: imcDocs.length > 0 ? Math.round((sumaIMC / imcDocs.length) * 10) / 10 : null,
            distribucionIMC,
            prevalencias: patologias.map((p) => ({
                nombre: p._id,
                pacientes: p.pacientes,
                porcentaje: total > 0 ? Math.round((p.pacientes / total) * 100) : 0,
            })),
            evolucion: evolucion.map((e) => ({
                year: e._id.year,
                month: e._id.month,
                pesoPromedio: Math.round(e.pesoPromedio * 10) / 10,
                imcPromedio: e.imcPromedio ? Math.round(e.imcPromedio * 10) / 10 : null,
                mediciones: e.mediciones,
            })),
        },
    });
}, { message: 'Error al obtener las estadísticas poblacionales' });
