# 🏦 CrediMaster Pro v3.3

**Suite Financiera Avanzada para Simulación y Optimización de Créditos Hipotecarios**

---

## 📋 Descripción

CrediMaster Pro es una aplicación web completa diseñada para ayudar a usuarios colombianos a:

- ✅ **Simular** estrategias de pago de créditos hipotecarios
- 💰 **Calcular** ahorros potenciales en intereses
- 📊 **Visualizar** proyecciones financieras interactivas
- 📄 **Generar** documentos legales para abonos extraordinarios
- 🎯 **Optimizar** estrategias de pago con efecto "bola de nieve"

### Características Principales

#### 🔢 Motor de Cálculo Avanzado
- **Créditos en Pesos (Tasa Fija)**: Simulación con tasa de interés fija
- **Créditos UVR (Indexados)**: Cálculo con inflación proyectada y actualización mensual de UVR
- **Subsidios FRECH/Ecobertura**: Soporte completo para créditos con cobertura gubernamental
- **Calibración por Extracto**: Ingresa datos de tu factura para máxima precisión

#### 📈 Visualizaciones Interactivas
- Gráficos de evolución de deuda (Banco vs. Estrategia)
- Métricas clave: Ahorro en intereses, tiempo ganado, costo total
- Tabla de amortización detallada exportable a CSV

#### 💼 Herramientas Profesionales
- **Estudio Financiero**: Analiza tu capacidad de pago según ingresos/gastos
- **Generador Legal**: Crea cartas de derecho de petición con respaldo jurídico (Ley 546 de 1999)
- **IA Advisor**: Recomendaciones personalizadas basadas en tu situación

#### 🎨 Diseño Moderno
- Interfaz responsiva (Mobile-first)
- Tema profesional con Tailwind CSS
- Animaciones fluidas y experiencia de usuario optimizada

---

## 🏗️ Estructura del Proyecto

```
credimaster-pro/
│
├── index.html              # Estructura HTML principal
├── styles/
│   └── main.css           # Estilos personalizados y diseño
├── scripts/
│   ├── app.js             # Componente principal de React
│   ├── calculator.js      # Motor de cálculo financiero
│   ├── components/
│   │   ├── Dashboard.js   # Vista principal con métricas
│   │   ├── Budget.js      # Análisis de flujo de caja
│   │   ├── Legal.js       # Generador de documentos
│   │   ├── Forms.js       # Formularios de entrada
│   │   └── UI.js          # Componentes reutilizables
│   └── utils.js           # Funciones auxiliares
├── README.md              # Este archivo

```

---

## 🚀 Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Conexión a internet (para cargar CDNs de librerías)

### Instalación Local

1. **Descarga los archivos** del proyecto en una carpeta local

2. **Abre `index.html`** directamente en tu navegador
   - Opción 1: Doble clic en el archivo
   - Opción 2: Arrastra el archivo a tu navegador
   - Opción 3: Usar un servidor local (recomendado para desarrollo)

3. **Servidor Local (Opcional)**
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   
   # Luego visita: http://localhost:8000
   ```

### Uso sin Instalación
La aplicación es 100% cliente, no requiere backend. Puedes:
- Usar desde archivo local
- Subir a cualquier hosting estático (GitHub Pages, Netlify, Vercel)
- Compartir por correo/USB

---

## 📖 Guía de Uso

### 1️⃣ Configuración Inicial

**Paso 1: Selecciona el tipo de crédito**
- **PESOS (Tasa Fija)**: Para créditos tradicionales
- **UVR (Indexado)**: Para créditos con inflación

**Paso 2: Ingresa los datos básicos**
- Saldo de la deuda actual
- Tasa de interés E.A. (Efectiva Anual)
- Plazo restante en meses
- Valor de seguros mensuales

**Paso 3: Calibración (Recomendado)**
Para máxima precisión, ingresa datos de tu última factura:
- Abono a capital actual
- Intereses corrientes
- Valor total de la cuota

### 2️⃣ Configuración de Estrategia

**Abono Extra Mensual**
- Ingresa cuánto puedes abonar adicionalmente cada mes
- El sistema calculará el impacto automáticamente

**Opciones Avanzadas**
- ✨ **Incremento Anual**: Aumenta el abono cada año (efecto bola de nieve)
- 🎁 **Usar Primas**: Duplica el abono en junio y diciembre
- 💵 **Abono Único Inicial**: Pago extraordinario al inicio

**Subsidios FRECH/Ecobertura**
Si tu crédito tiene cobertura:
1. Activa "Tiene Subsidio FRECH"
2. Ingresa los puntos de subsidio
3. Especifica cuántas cuotas quedan de cobertura
4. (Opcional) Ingresa el valor exacto del beneficio mensual

### 3️⃣ Análisis de Resultados

**Dashboard Principal**
- 💰 **Ahorro en Intereses**: Cuánto dinero ahorras vs. pago normal
- ⏱️ **Tiempo Ganado**: Años y meses que terminas antes
- 📊 **Costo Total**: Multiplicador sobre el monto prestado
- 🎯 **Impacto Estrategia**: Evaluación cualitativa

**Gráfico de Proyección**
- Línea punteada gris: Evolución sin abonos extras
- Línea sólida verde: Tu estrategia optimizada
- Visualiza cuándo te liberas de la deuda

**Tabla Detallada**
- Amortización mes a mes
- Exportable a Excel/CSV
- Incluye: Cuota, intereses, capital, seguros, saldo

### 4️⃣ Herramientas Adicionales

**Estudio Financiero**
1. Ingresa tus ingresos mensuales
2. Desglosa tus gastos por categoría
3. El sistema calcula tu capacidad real de ahorro
4. Aplica automáticamente el abono sugerido

**Generador Legal**
1. Completa tus datos personales
2. Elige el objetivo: Reducir plazo o reducir cuota
3. Descarga la carta en formato Word o imprime como PDF
4. Presenta el documento al banco

---

## 🧮 Lógica de Cálculo

### Fórmulas Principales

#### Tasa Mensual
```javascript
tasaMensual = (1 + tasaEA/100)^(1/12) - 1
```

#### Cuota Fija (Sistema Francés - PMT)
```javascript
PMT = P × [r(1+r)^n] / [(1+r)^n - 1]

Donde:
- P = Principal (saldo)
- r = tasa mensual
- n = número de meses
```

#### Actualización UVR
```javascript
UVR(mes+1) = UVR(mes) × (1 + inflaciónMensual)

inflaciónMensual = (1 + inflaciónAnual/100)^(1/12) - 1
```

#### Subsidio FRECH
```javascript
// Opción 1: Por valor exacto
subsidioMensual = valorBeneficioExtracto

// Opción 2: Por puntos
tasaConFRECH = tasaOriginal - puntosFRECH
subsidioMensual = saldo × (tasaOriginal - tasaConFRECH)
```

### Simulación Mensual

Para cada mes:
1. **Actualizar inflación** (si aplica)
   - Ajustar UVR
   - Ajustar seguros (si está activo)

2. **Calcular intereses**
   - Interés completo = saldo × tasa mensual
   - Subsidio FRECH (si aplica)
   - Interés neto = interés completo - subsidio

3. **Calcular capital**
   - Capital ordinario = cuota fija - interés completo
   - Abono extra = definido por usuario (+ primas si aplica)
   - Capital total = capital ordinario + abono extra

4. **Actualizar saldo**
   - Nuevo saldo = saldo anterior - capital total
   - Si saldo ≤ 0, finalizar

5. **Registrar en tabla**
   - Guardar todos los valores del mes
   - Acumular totales

---

## 🔧 Tecnologías Utilizadas

### Frontend
- **React 18.2.0**: Framework UI declarativo
- **Tailwind CSS 3.x**: Framework de utilidades CSS
- **Recharts 2.12.0**: Librería de gráficos
- **Lucide React 0.292.0**: Iconos SVG modernos

### Herramientas
- **Babel Standalone**: Transpilación JSX en navegador
- **ES Modules**: Sistema de módulos moderno
- **LocalStorage API**: Persistencia de datos

### Fuentes
- **Inter**: Sans-serif moderna para UI
- **Merriweather**: Serif elegante para documentos

---

## 💾 Persistencia de Datos

La aplicación guarda automáticamente tu configuración en el navegador:

```javascript
// Datos guardados automáticamente:
- Tipo de crédito (Pesos/UVR)
- Todos los parámetros del crédito
- Estrategia de pago configurada
- Opciones de subsidios
```

**Ventajas:**
- ✅ Tus datos persisten entre sesiones
- ✅ No se envía información a servidores externos
- ✅ Privacidad total (todo local)

**Limitaciones:**
- ⚠️ Los datos se borran si limpias el navegador
- ⚠️ No sincroniza entre dispositivos

---

## 📱 Compatibilidad

### Navegadores Soportados
| Navegador | Versión Mínima | Estado |
|-----------|----------------|--------|
| Chrome    | 90+            | ✅ Completo |
| Firefox   | 88+            | ✅ Completo |
| Safari    | 14+            | ✅ Completo |
| Edge      | 90+            | ✅ Completo |
| Opera     | 76+            | ✅ Completo |

### Dispositivos
- 📱 **Móviles**: Diseño optimizado touch-first
- 💻 **Tablets**: Layout adaptativo
- 🖥️ **Desktop**: Experiencia completa con sidebar

---

## 🐛 Solución de Problemas

### La aplicación no carga
**Problema**: Pantalla blanca o error en consola

**Solución**:
1. Verifica conexión a internet (CDNs necesarios)
2. Usa Chrome/Firefox actualizados
3. Limpia caché del navegador
4. Abre en modo incógnito

### Los cálculos parecen incorrectos
**Problema**: Números no coinciden con el banco

**Solución**:
1. Usa la **Calibración por Extracto** (máxima precisión)
2. Verifica que la tasa sea **Efectiva Anual** (no nominal)
3. Para UVR, ingresa el valor UVR exacto de tu factura
4. Confirma que el plazo restante sea correcto

### No se guardan los datos
**Problema**: Configuración se pierde al recargar

**Solución**:
1. Verifica que LocalStorage esté habilitado
2. No uses modo incógnito
3. Revisa permisos del navegador

### Error al exportar CSV
**Problema**: No descarga el archivo

**Solución**:
1. Permite descargas en el navegador
2. Verifica espacio en disco
3. Intenta con otro navegador

---

## 🔐 Seguridad y Privacidad

### Datos Privados
- ✅ **100% Local**: Ningún dato se envía a servidores
- ✅ **Sin Tracking**: No hay análisis ni cookies de terceros
- ✅ **Open Source**: Código auditable y transparente

### Recomendaciones
- 🔒 No compartas pantallas con datos sensibles
- 💾 Haz backup de tu configuración (exporta CSV)
- 🚫 No uses en computadoras públicas sin borrar datos después

---

## 🎯 Casos de Uso

### Caso 1: Profesional con Prima
**Situación**: Ganas $8M, recibes prima semestral de $4M

**Estrategia**:
1. Abono mensual: $800.000
2. Activa "Usar Primas" (duplica en Jun/Dic)
3. Incremento anual: 5% (bola de nieve)

**Resultado**: Reducción de 8 años en plazo de 20 años

### Caso 2: Crédito UVR con FRECH
**Situación**: Crédito de $150M UVR, subsidio 4 puntos, quedan 60 cuotas

**Estrategia**:
1. Activa modo UVR
2. Ingresa saldo UVR y valor UVR del extracto
3. Configura FRECH: 4 puntos, 60 meses
4. Abono modesto: $300.000/mes

**Resultado**: Aprovecha subsidio + abonos, ahorro masivo en intereses

### Caso 3: Refinanciación
**Situación**: Tienes un pago único de $10M (cesantías)

**Estrategia**:
1. Abono único inicial: $10.000.000
2. Mantén cuota original como "extra mensual"
3. Efecto: Reducción inmediata del capital

**Resultado**: Plazo reducido en ~3 años

---

## 📊 Ejemplo de Cálculo

### Datos de Entrada
```
Saldo: $180.000.000
Tasa E.A.: 13,5%
Plazo: 240 meses (20 años)
Seguros: $65.000
Abono extra: $400.000/mes
```

### Resultados (Sin Abonos)
```
Cuota mensual: ~$2.450.000
Intereses totales: ~$408.000.000
Costo total: ~$588.000.000 (3.27x)
Duración: 240 meses
```

### Resultados (Con Abonos)
```
Cuota total: ~$2.850.000 (+16,3%)
Intereses totales: ~$198.000.000
Costo total: ~$378.000.000 (2.10x)
Duración: 128 meses (~10.7 años)

✅ Ahorro: $210.000.000
✅ Tiempo ganado: 112 meses (9.3 años)
```

---

## 🤝 Contribuciones

Este es un proyecto de código abierto. Para contribuir:

1. **Reporta bugs**: Describe el problema y pasos para reproducir
2. **Sugiere mejoras**: Ideas de nuevas funcionalidades
3. **Comparte casos de uso**: Ayuda a otros usuarios

---

## 📄 Licencia y Legal

### Uso del Software
- ✅ **Uso personal**: Completamente gratuito
- ✅ **Redistribución**: Permitida con atribución
- ⚠️ **Sin garantías**: Uso bajo tu propio riesgo

### Disclaimer Legal
> Esta herramienta es **únicamente informativa**. Los cálculos son aproximados y pueden diferir de los valores reales de tu entidad financiera. Siempre verifica con tu banco antes de tomar decisiones financieras.

> El generador de documentos legales proporciona plantillas basadas en la Ley 546 de 1999, pero **no constituye asesoría legal**. Consulta con un abogado si tienes dudas.

### Créditos
**Desarrollado por**: Jose Mejia  
**Versión**: 3.3  
**Año**: 2025  

---

## 📞 Soporte y Contacto

### Preguntas Frecuentes
Revisa la sección "Solución de Problemas" más arriba

### Comunidad
- Comparte en redes con #CrediMasterPro
- Ayuda a otros usuarios en foros

---

## 🗺️ Roadmap Futuro

### v3.4 (Próxima)
- [ ] Comparador de bancos
- [ ] Gráficos de flujo de caja
- [ ] Alertas inteligentes

### v4.0 (Futuro)
- [ ] PWA (App instalable)
- [ ] Modo offline completo
- [ ] Exportación PDF mejorada
- [ ] Multi-idioma (inglés)

---

## 📚 Referencias

### Legislación
- [Ley 546 de 1999 - Ley de Vivienda](https://www.suin-juriscol.gov.co/)
- Circular Básica Jurídica - Superintendencia Financiera

### Recursos Financieros
- Banco de la República: Calculadoras UVR
- DANE: Índices de inflación
- Asobancaria: Información sobre créditos

---

**¡Gracias por usar CrediMaster Pro! 🎉**

*Tu camino hacia la libertad financiera comienza con un solo abono extra.*
