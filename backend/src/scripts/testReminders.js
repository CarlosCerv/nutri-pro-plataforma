import mongoose from 'mongoose';
import dotenv from 'dotenv';
import reminderService from '../services/reminderService.js';
import connectDB from '../config/database.js';

dotenv.config();

/**
 * Manual test script for appointment reminders
 * Run with: node src/scripts/testReminders.js
 */

const testReminders = async () => {
    try {
        console.log('🧪 Testing Appointment Reminder System\n');
        console.log('=======================================\n');

        // Connect to database
        await connectDB();
        console.log('✅ Connected to database\n');

        // Run the reminder check
        console.log('Running reminder check...\n');
        const result = await reminderService.checkAndSendReminders();

        console.log('\n=======================================');
        console.log('📊 Test Results:');
        console.log(`   Total appointments found: ${result.total || 0}`);
        console.log(`   Reminders sent: ${result.sent || 0}`);
        console.log(`   Failed: ${result.failed || 0}`);
        console.log('=======================================\n');

        console.log('✅ Test completed');

        // Exit
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
};

// Run the test
testReminders();
