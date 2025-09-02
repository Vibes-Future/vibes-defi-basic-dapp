# 🚀 Guía de Despliegue - VIBES DeFi App

## 📋 Requisitos Previos

1. **Docker Desktop** instalado y ejecutándose
   - Descargar desde: https://www.docker.com/products/docker-desktop
   - Asegúrate de que esté ejecutándose antes de continuar

2. **Node.js** (ya instalado en tu sistema)
3. **Git** (para clonar el repositorio)

## 🚀 Despliegue Rápido

### Opción 1: Script Automático (Recomendado)

**En Windows:**
```bash
# Ejecutar el script de despliegue
deploy.bat
```

**En Linux/Mac:**
```bash
# Hacer ejecutable y ejecutar
chmod +x deploy.sh
./deploy.sh
```

### Opción 2: Comandos Manuales

```bash
# 1. Instalar dependencias
npm install

# 2. Construir la aplicación
npm run build

# 3. Construir la imagen Docker
docker build -t vibes-defi-app .

# 4. Desplegar con Docker Compose
docker-compose up --build -d
```

## 🌐 Acceso a la Aplicación

Una vez desplegada, tu aplicación estará disponible en:

- **Aplicación principal:** http://localhost:3000
- **Con Nginx (producción):** http://localhost (puerto 80)

## 🔧 Configuración de Producción

### Variables de Entorno

Antes del despliegue en producción, actualiza las variables en `docker-compose.yml`:

```yaml
environment:
  # Red de Solana
  - NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
  - NEXT_PUBLIC_RPC_ENDPOINT=https://tu-helius-rpc-endpoint
  
  # IDs de Programas (ACTUALIZAR CON TUS IDs REALES)
  - NEXT_PUBLIC_PRESALE_PROGRAM_ID=tu-presale-program-id
  - NEXT_PUBLIC_STAKING_PROGRAM_ID=tu-staking-program-id
  - NEXT_PUBLIC_VESTING_PROGRAM_ID=tu-vesting-program-id
```

### Despliegue con Nginx (Producción)

```bash
# Desplegar con proxy Nginx
docker-compose --profile production up --build -d
```

## 📊 Comandos Útiles

### Ver logs de la aplicación
```bash
docker-compose logs -f vibes-defi-app
```

### Ver logs de todos los servicios
```bash
docker-compose logs -f
```

### Detener la aplicación
```bash
docker-compose down
```

### Reiniciar la aplicación
```bash
docker-compose restart
```

### Ver estado de los contenedores
```bash
docker-compose ps
```

## 🔍 Verificación del Despliegue

1. **Verificar que los contenedores estén ejecutándose:**
   ```bash
   docker-compose ps
   ```

2. **Verificar la salud de la aplicación:**
   ```bash
   curl http://localhost:3000
   ```

3. **Verificar logs para errores:**
   ```bash
   docker-compose logs vibes-defi-app
   ```

## 🚨 Solución de Problemas

### Error: "Docker is not running"
- Asegúrate de que Docker Desktop esté iniciado
- Espera a que Docker Desktop se cargue completamente

### Error: "Build failed"
- Verifica que todas las dependencias estén instaladas: `npm install`
- Limpia la caché de Docker: `docker system prune -a`

### Error: "Port already in use"
- Cambia el puerto en `docker-compose.yml` o detén otros servicios en el puerto 3000

### Error: "Permission denied"
- En Linux/Mac, ejecuta con `sudo` si es necesario
- En Windows, ejecuta PowerShell como administrador

## 🌍 Despliegue en Servidores Remotos

### VPS/Dedicated Server
```bash
# En tu servidor
git clone https://github.com/tu-usuario/vibes-defi-basic-dapp.git
cd vibes-defi-basic-dapp
docker-compose --profile production up -d --build
```

### Cloud Platforms

#### DigitalOcean App Platform
1. Conecta tu repositorio GitHub
2. Configura las variables de entorno
3. El despliegue es automático

#### AWS ECS/Fargate
```bash
# Construir y subir a ECR
docker build -t vibes-defi .
docker tag vibes-defi:latest YOUR_ECR_URI:latest
docker push YOUR_ECR_URI:latest
```

#### Google Cloud Run
```bash
# Construir y desplegar
gcloud builds submit --tag gcr.io/PROJECT_ID/vibes-defi
gcloud run deploy --image gcr.io/PROJECT_ID/vibes-defi --platform managed
```

## 🔒 Seguridad en Producción

1. **Configurar SSL/HTTPS** con Let's Encrypt
2. **Actualizar nginx.conf** con tu dominio
3. **Configurar firewall** para permitir solo puertos 80 y 443
4. **Usar variables de entorno** para secretos sensibles

## 📈 Monitoreo

### Health Checks
La aplicación incluye health checks automáticos que verifican:
- Disponibilidad del puerto 3000
- Respuesta HTTP de la aplicación
- Estado de los contenedores

### Logs
Los logs se pueden ver en tiempo real:
```bash
docker-compose logs -f
```

## ✅ Lista de Verificación Pre-Despliegue

- [ ] Docker Desktop instalado y ejecutándose
- [ ] Variables de entorno configuradas
- [ ] IDs de programas actualizados para mainnet
- [ ] RPC endpoint configurado (preferiblemente Helius)
- [ ] Dominio configurado (si aplica)
- [ ] SSL certificados obtenidos (si aplica)
- [ ] Firewall configurado
- [ ] Backup de datos (si aplica)

## 🎯 ¡Listo para Desplegar!

Tu aplicación VIBES DeFi está lista para ser desplegada. Ejecuta `deploy.bat` (Windows) o `./deploy.sh` (Linux/Mac) para comenzar el proceso automático de despliegue.
