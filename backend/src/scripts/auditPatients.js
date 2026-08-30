// Read-only audit: counts Patient documents missing the `nutritionist` field.
// Does not modify any data. Run with: node src/scripts/auditPatients.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function auditPatients() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not set. Aborting audit — refusing to guess a connection target.');
        process.exit(1);
    }

    console.log(`Connecting to: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
    await mongoose.connect(uri);

    // Query the raw collection with the native driver so Mongoose's schema
    // (which now declares `nutritionist`) cannot mask documents missing it.
    const collection = mongoose.connection.db.collection('patients');

    const total = await collection.countDocuments({});
    const missing = await collection.countDocuments({
        $or: [{ nutritionist: { $exists: false } }, { nutritionist: null }],
    });

    console.log(`Total patients: ${total}`);
    console.log(`Patients missing "nutritionist": ${missing}`);

    if (missing > 0) {
        const sample = await collection
            .find({ $or: [{ nutritionist: { $exists: false } }, { nutritionist: null }] })
            .project({ firstName: 1, lastName: 1, createdAt: 1 })
            .limit(10)
            .toArray();
        console.log('Sample of affected documents (up to 10):');
        console.log(sample);
        console.log('\nNo automatic migration was run. Decide manually how to handle these records.');
    } else {
        console.log('No orphaned patients found. Safe to rely on the required "nutritionist" field.');
    }

    await mongoose.disconnect();
}

auditPatients().catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
});
