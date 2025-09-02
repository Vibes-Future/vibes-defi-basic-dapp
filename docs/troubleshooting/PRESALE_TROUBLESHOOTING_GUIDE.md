# 🔍 VIBES Presale - Guía de Diagnóstico

## ❌ Problema: "Cuando intento comprar VIBES tokens no pasa nada"

## 🎯 Posibles Causas y Soluciones

### 1. **Problema de PDA (Program Derived Address)**

**Causa Principal:** El PDA calculado por el frontend no coincide con el PDA real del presale desplegado.

- **PDA esperado (keypairs.json):** `7eNN8j92e3wBUUWTowTcZDBU72Hv56VLtpgafHQgcHST`
- **Program ID:** `6Bofmx11CpBEy6iXqGs68HVHaZHw9Y3U1TYRYUhRA2wk`

**Diagnóstico:**
1. Abre la consola del navegador (F12)
2. Ve a http://localhost:3000
3. Busca estos logs:
   ```
   ❌ Presale state not found at PDA: [CALCULATED_PDA]
   🔍 Expected PDA from keypairs.json: 7eNN8j92e3wBUUWTowTcZDBU72Hv56VLtpgafHQgcHST
   🔍 Calculated PDA: [DIFFERENT_PDA]
   📋 Program ID: 6Bofmx11CpBEy6iXqGs68HVHaZHw9Y3U1TYRYUhRA2wk
   ```

**Solución:**
- Si los PDAs no coinciden, necesitamos actualizar el método de cálculo del PDA en el frontend

### 2. **Problema de Red (Network)**

**Causa:** Tu wallet no está en devnet o hay problemas de conectividad RPC.

**Diagnóstico:**
1. **Verificar red del wallet:**
   - Phantom: Settings → Change Network → Devnet
   - Solflare: Settings → Network → Devnet

2. **Verificar RPC endpoint:** En la consola busca:
   ```
   🌐 RPC Endpoint: https://api.devnet.solana.com
   ```

**Solución:**
- Cambiar wallet a devnet
- Verificar que tienes SOL de devnet (usar faucet si es necesario)

### 3. **Problema de Wallet Connection**

**Causa:** El wallet no está conectado o no tiene permisos adecuados.

**Diagnóstico:**
1. Verificar que el botón "Connect Wallet" muestra tu dirección
2. Verificar balance de SOL en devnet
3. Verificar que el wallet está autorizado para firmar transacciones

**Solución:**
- Reconectar wallet
- Obtener SOL de devnet: https://faucet.solana.com/

### 4. **Problema de Estado del Presale**

**Causa:** El presale no está activo o tiene restricciones.

**Diagnóstico en consola:**
```javascript
// En la consola del navegador:
console.log('Current time:', Date.now() / 1000);
// Comparar con startTs y endTs del presale
```

### 5. **Problema de Token Accounts**

**Causa:** No existe la cuenta de token asociada para VIBES o USDC.

**Diagnóstico:**
- El error aparecerá al intentar crear la transacción
- Buscar errores relacionados con "Associated Token Account"

## 🚀 Pasos de Diagnóstico Inmediato

### Paso 1: Verificar Configuración
```bash
# En la consola del navegador (F12):
console.log('PRESALE_PROGRAM_ID:', '6Bofmx11CpBEy6iXqGs68HVHaZHw9Y3U1TYRYUhRA2wk');
console.log('VIBES_MINT:', '84LT3VSyUEoyyt4u3D4No2fCfHnMdh7noyG2qd8FiQbo');
console.log('USDC_MINT:', '3HUzJfpyyFS4XodTRPFkGqjjGo7MHhQqJMwFu1HMkuUe');
```

### Paso 2: Verificar Wallet
1. **Red:** Debe ser Devnet
2. **Balance:** Debe tener > 0.1 SOL
3. **Conexión:** Botón debe mostrar tu dirección

### Paso 3: Verificar Presale State
En la consola:
```javascript
// Verificar si el presale está cargando datos correctos
// Buscar logs que muestren el estado del presale
```

### Paso 4: Verificar Transacción
1. Intenta comprar con una cantidad pequeña (0.01 SOL)
2. Observa errores en la consola
3. Verifica si aparece prompt para firmar transacción

## 🔧 Soluciones Técnicas

### Solución 1: Actualizar PDA Calculation
Si el PDA calculado no coincide, necesitamos:

```typescript
// Usar el PDA correcto desde keypairs.json
const PRESALE_PDA = new PublicKey('7eNN8j92e3wBUUWTowTcZDBU72Hv56VLtpgafHQgcHST');
```

### Solución 2: Implementar Anchor Program Client
```typescript
// Usar Anchor para comunicación directa con el programa
const program = new anchor.Program(idl, PRESALE_PROGRAM_ID, provider);
```

### Solución 3: Verificar Account Initialization
```typescript
// Verificar si las cuentas necesarias existen
const presaleAccount = await connection.getAccountInfo(presalePDA);
const buyerAccount = await connection.getAccountInfo(buyerPDA);
```

## 📊 Información de Debug Esperada

Cuando abras la consola del navegador, debes ver:

1. **Inicialización del servicio:**
   ```
   ✅ Simple PresaleService initialized with program ID: 6Bofmx11CpBEy6iXqGs68HVHaZHw9Y3U1TYRYUhRA2wk
   ```

2. **Estado del presale:**
   ```
   ❌ Presale state not found at PDA: [CALCULATED_PDA]
   🔍 Expected PDA from keypairs.json: 7eNN8j92e3wBUUWTowTcZDBU72Hv56VLtpgafHQgcHST
   ```

3. **Conexión del wallet:**
   ```
   Wallet connected: [TU_DIRECCION]
   Network: devnet
   Balance: [TU_BALANCE] SOL
   ```

## 🎯 Próximos Pasos

1. **Abre http://localhost:3000**
2. **Abre la consola del navegador (F12)**
3. **Conecta tu wallet**
4. **Intenta una compra pequeña**
5. **Copia y pega todos los logs de la consola**

Con esa información podré identificar exactamente el problema y crear la solución específica.

## 💡 Solución Rápida Temporal

Mientras diagnosticamos, puedes verificar que el presale funciona usando el script de prueba:

```bash
# En el directorio del smart contract:
cd ../vibe-future-smart-contract-1
node scripts/test_presale.js
```

Esto verificará si el presale funciona directamente con Node.js y confirmará que el problema está en la integración frontend-blockchain.

---

## 🔍 Información Actual del Sistema

- **Presale Program ID:** `6Bofmx11CpBEy6iXqGs68HVHaZHw9Y3U1TYRYUhRA2wk`
- **Presale PDA:** `7eNN8j92e3wBUUWTowTcZDBU72Hv56VLtpgafHQgcHST`
- **Status:** Deployed & Tested (según keypairs.json)
- **Network:** Devnet
- **Frontend:** http://localhost:3000
