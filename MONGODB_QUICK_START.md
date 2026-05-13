# ⚡ Inicio Rápido: MongoDB Local

Ejecuta estos comandos **en orden** desde el directorio `backend/`:

## Paso 1: Verificar MongoDB está corriendo

```powershell
# En PowerShell (Windows)
Get-Service MongoDB | Select-Object Status
# Debe mostrar: Status : Running
```

Si no aparece nada o dice "Stopped", abre Services.msc y inicia MongoDB.

## Paso 2: Verificar conexión a MongoDB

```bash
cd backend
npm run test:connection
```

**Resultado esperado:**
```
✅ CONEXIÓN EXITOSA
🖥️  Host: localhost
📊 Base de datos: nutripro
📚 Colecciones (0):
   ⚠️  No hay colecciones. Ejecuta: npm run seed:all
✨ Todo está configurado correctamente
```

## Paso 3: Cargar datos iniciales

```bash
npm run seed:all
```

**Resultado esperado:**
```
📦 Conectado a MongoDB
✅ Alimentos insertados: 45+
✅ Plantillas insertadas: 5+
✅ Usuarios creados:
   👤 Nutricionista: nutricionista@test.com / password123
   👤 Paciente: paciente@test.com / password123
✅ Script completado
```

## Paso 4: Iniciar servidor backend

```bash
npm run dev
```

**Resultado esperado:**
```
📦 Conectado a MongoDB
✅ MongoDB Connected: localhost
🚀 Server running on port 5000 in development mode
```

## Paso 5: Iniciar frontend (en otra terminal)

```bash
cd frontend
npm run dev
```

**Abre en navegador:** http://localhost:5173

---

## ✅ Testing Rápido

Intenta estos logins:

### Nutricionista:
- Email: `nutricionista@test.com`
- Contraseña: `password123`

### Paciente:
- Email: `paciente@test.com`
- Contraseña: `password123`

---

## 🆘 Si algo no funciona

### Error: "Cannot find module 'mongoose'"
```bash
cd backend
npm install
```

### Error: "MongoDB service not running"
```powershell
# Windows - Abre Services.msc y busca "MongoDB Server"
# Haz clic derecho → "Start"

# O en PowerShell como Admin:
Start-Service MongoDB
```

### Error: "ECONNREFUSED localhost:27017"
MongoDB no está corriendo. Ver solución anterior.

### Error: "User already exists"
Los datos ya fueron cargados. Limpia la base de datos:

```powershell
# En MongoDB Compass:
# 1. Conecta a localhost:27017
# 2. Selecciona BD "nutripro"
# 3. Haz clic derecho → "Drop Database"
# 4. Luego: npm run seed:all
```

---

## 📊 Verificar datos en MongoDB Compass

1. **Descarga:** https://www.mongodb.com/products/compass
2. **Conecta a:** `mongodb://localhost:27017`
3. **BD:** Haz clic en `nutripro`
4. **Verifica colecciones:**
   - `users` → 3 documentos
   - `foods` → 45+ documentos
   - `diettemplates` → 5+ documentos

---

## 🚀 Siguientes Pasos

Después de probar localmente:

1. **Para PRODUCCIÓN:** Lee [MONGODB_SETUP_GUIDE.md](./MONGODB_SETUP_GUIDE.md) → Fase 3-5
2. **MongoDB Atlas** → Crear cluster
3. **Deploy en Vercel** → Configurar ENV vars
4. **Testing en Producción** → Probar endpoints

---

**¡Listo! Ahora tienes MongoDB corriendo localmente.** 🎉
