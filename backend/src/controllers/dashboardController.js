import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
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

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};
