import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testConnection = async () => {
  console.log('\n🧪 Test de Conexión MongoDB\n');
  console.log('━'.repeat(50));
  
  try {
    console.log(`📍 Conectando a: ${process.env.MONGODB_URI}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🎯 Puerto: ${process.env.PORT}`);
    console.log('');
    
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ CONEXIÓN EXITOSA\n');
    console.log(`🖥️  Host: ${connection.connection.host}`);
    console.log(`📊 Base de datos: ${connection.connection.db.databaseName}`);
    console.log(`🔌 Puerto: ${connection.connection.port}`);
    
    // List all collections
    const collections = await connection.connection.db.listCollections().toArray();
    console.log(`\n📚 Colecciones (${collections.length}):`);
    
    if (collections.length === 0) {
      console.log('   ⚠️  No hay colecciones. Ejecuta: npm run seed:all');
    } else {
      collections.forEach(col => {
        console.log(`   ✓ ${col.name}`);
      });
    }

    console.log('\n📈 Estadísticas:');
    for (const col of collections) {
      const count = await connection.connection.db.collection(col.name).countDocuments();
      console.log(`   ${col.name}: ${count} documentos`);
    }

    console.log('\n' + '━'.repeat(50));
    console.log('✨ Todo está configurado correctamente\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN\n');
    console.error(`Error: ${error.message}`);
    console.error('\n💡 Posibles soluciones:');
    console.error('   1. Verifica que MongoDB está corriendo');
    console.error('   2. Verifica MONGODB_URI en .env');
    console.error('   3. En Windows: Get-Service MongoDB | Select-Object Status');
    console.error('   4. En Mac/Linux: mongod (en otra terminal)');
    console.error('   5. Reinicia el servidor: npm run dev\n');
    process.exit(1);
  }
};

testConnection();
