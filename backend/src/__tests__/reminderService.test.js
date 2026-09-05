import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/emailService.js', () => ({
    sendAppointmentReminder: vi.fn(),
}));
vi.mock('../services/smsService.js', () => ({
    sendAppointmentReminder: vi.fn(),
}));
vi.mock('../services/whatsappService.js', () => ({
    sendAppointmentReminder: vi.fn(),
}));

import * as emailService from '../services/emailService.js';
import * as smsService from '../services/smsService.js';
import * as whatsappService from '../services/whatsappService.js';
import { checkAndSendReminders } from '../services/reminderService.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';

async function createNutritionist() {
    return User.create({
        name: 'Nutriólogo',
        email: `nutri-${Date.now()}-${Math.random()}@example.com`,
        password: 'password123',
        role: 'nutritionist',
    });
}

async function createPatient(nutritionistId, overrides = {}) {
    return Patient.create({
        nutritionist: nutritionistId,
        firstName: 'Paciente',
        lastName: 'De Prueba',
        ...overrides,
    });
}

/** Cita 24 h en el futuro — dentro de la ventana de 0-36h que revisa el cron. */
async function createUpcomingAppointment(nutritionistId, patientId, overrides = {}) {
    return Appointment.create({
        nutritionist: nutritionistId,
        patient: patientId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        time: '10:00',
        status: 'scheduled',
        reminderSent: false,
        ...overrides,
    });
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('reminderService.checkAndSendReminders', () => {
    it('envía por WhatsApp (canal preferido) cuando el paciente tiene teléfono, y no intenta SMS', async () => {
        whatsappService.sendAppointmentReminder.mockResolvedValue(true);

        const nutritionist = await createNutritionist();
        const patient = await createPatient(nutritionist._id, { email: 'paciente@example.com', phone: '5551234567' });
        const appointment = await createUpcomingAppointment(nutritionist._id, patient._id);

        const result = await checkAndSendReminders();

        expect(result.sent).toBe(1);
        expect(emailService.sendAppointmentReminder).toHaveBeenCalledTimes(1);
        expect(whatsappService.sendAppointmentReminder).toHaveBeenCalledTimes(1);
        expect(smsService.sendAppointmentReminder).not.toHaveBeenCalled();

        const updated = await Appointment.findById(appointment._id);
        expect(updated.reminderSent).toBe(true);
        expect(updated.reminderWhatsApp).toBe(true);
        expect(updated.reminderSMS).toBe(false);
    });

    it('cae a SMS si WhatsApp falla', async () => {
        whatsappService.sendAppointmentReminder.mockResolvedValue(false);
        smsService.sendAppointmentReminder.mockResolvedValue(true);

        const nutritionist = await createNutritionist();
        const patient = await createPatient(nutritionist._id, { phone: '5551234567' });
        await createUpcomingAppointment(nutritionist._id, patient._id);

        const result = await checkAndSendReminders();

        expect(result.sent).toBe(1);
        expect(whatsappService.sendAppointmentReminder).toHaveBeenCalledTimes(1);
        expect(smsService.sendAppointmentReminder).toHaveBeenCalledTimes(1);
    });

    it('no intenta ningún canal de teléfono si el paciente no tiene teléfono', async () => {
        const nutritionist = await createNutritionist();
        const patient = await createPatient(nutritionist._id, { email: 'paciente@example.com' });
        await createUpcomingAppointment(nutritionist._id, patient._id);

        emailService.sendAppointmentReminder.mockResolvedValue(true);

        await checkAndSendReminders();

        expect(whatsappService.sendAppointmentReminder).not.toHaveBeenCalled();
        expect(smsService.sendAppointmentReminder).not.toHaveBeenCalled();
    });

    it('cuenta como fallido si el paciente no tiene ni email ni teléfono', async () => {
        const nutritionist = await createNutritionist();
        const patient = await createPatient(nutritionist._id);
        const appointment = await createUpcomingAppointment(nutritionist._id, patient._id);

        const result = await checkAndSendReminders();

        expect(result.sent).toBe(0);
        expect(result.failed).toBe(1);

        const updated = await Appointment.findById(appointment._id);
        expect(updated.reminderSent).toBe(false);
    });

    it('no reprocesa una cita que ya tiene reminderSent en true', async () => {
        const nutritionist = await createNutritionist();
        const patient = await createPatient(nutritionist._id, { email: 'paciente@example.com' });
        await createUpcomingAppointment(nutritionist._id, patient._id, { reminderSent: true });

        const result = await checkAndSendReminders();

        expect(result.sent).toBe(0);
        expect(result.failed).toBe(0);
        expect(emailService.sendAppointmentReminder).not.toHaveBeenCalled();
    });
});
