import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calculator, TrendingDown, FileText, PieChart, DollarSign, 
  Calendar, AlertTriangle, ArrowRight, Download, Menu, X, 
  BrainCircuit, Wallet, Target, BarChart3, ShieldCheck, List, 
  ChevronRight, Info, Printer, Sparkles, Bot
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

// --- CONFIGURACIÓN API ---
const apiKey = ""; // La clave se inyecta en tiempo de ejecución

// --- UTILIDADES & HOOKS ---

const formatCOP = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value || 0);
};

// Hook para retrasar el cálculo masivo hasta que el usuario termine de escribir
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- COMPONENTES DE UI GENÉRICOS ---

const NumericInput = ({ label, value, onChange, type = 'currency', className = '' }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Sincronizar displayValue cuando el value externo cambia (ej. al cargar defaults)
  useEffect(() => {
    if (value === '' || value === null) {
        setDisplayValue('');
        return;
    }
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e) => {
    const rawVal = e.target.value.replace(/\./g, '').replace(/,/g, ''); // Eliminar formato visual
    
    if (rawVal === '') {
        setDisplayValue('');
        onChange(0);
        return;
    }

    if (!isNaN(rawVal)) {
        const numberVal = parseInt(rawVal, 10);
        setDisplayValue(formatNumber(numberVal)); // Mostrar con puntos
        onChange(numberVal); // Enviar numero limpio al estado
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
            {label}
            {type === 'percent' && <span className="text-slate-400 font-normal">% E.A.</span>}
        </label>
        <div className="relative group">
            {type === 'currency' && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-semibold group-focus-within:text-blue-500">$</span>
                </div>
            )}
            <input
                type="text"
                value={displayValue}
                onChange={handleChange}
                className={`block w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm font-bold text-slate-800 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all outline-none border ${type === 'currency' ? 'pl-7' : ''}`}
                placeholder="0"
            />
            {type === 'percent' && (
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-semibold">%</span>
                </div>
            )}
        </div>
    </div>
  );
};

const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="text-sm font-medium text-slate-700 leading-tight">
            {label}
        </div>
        <button 
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

// --- MOTOR DE CÁLCULO ---

const calculateEngine = (params) => {
  const { loanAmount, rateEA, years, insurance, extraMonthly, usePrimas, oneTimePayment } = params;
  
  if (!loanAmount || !rateEA || !years) return null;

  const rateMonthly = Math.pow(1 + rateEA / 100, 1 / 12) - 1;
  const totalMonthsOriginal = years * 12;

  // Cuota Fija Banco (Formula Anualidad)
  const pmtBase = loanAmount * (rateMonthly * Math.pow(1 + rateMonthly, totalMonthsOriginal)) / (Math.pow(1 + rateMonthly, totalMonthsOriginal) - 1);
  const pmtTotalObligatory = pmtBase + insurance;

  // 1. Simulación Banco (Base)
  let balanceBase = loanAmount;
  let totalInterestBase = 0;
  const scheduleBase = []; // Guardamos el estado del banco mes a mes para comparar

  for(let i = 1; i <= totalMonthsOriginal; i++) {
    const interest = balanceBase * rateMonthly;
    const capital = pmtBase - interest;
    balanceBase -= capital;
    totalInterestBase += interest;
    scheduleBase.push({
        month: i,
        balance: balanceBase > 0 ? balanceBase : 0,
        interestaccum: totalInterestBase
    });
  }
  const totalPaymentOriginal = loanAmount + totalInterestBase + (insurance * totalMonthsOriginal);

  // 2. Simulación Optimizada (Usuario)
  let schedule = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let totalInsurance = 0;
  let currentMonth = 0;
  
  const graphData = [];
  // Punto inicial (Mes 0)
  graphData.push({
      mes: 0,
      deudaBanco: loanAmount,
      deudaEstrategia: loanAmount,
      ahorroAcumulado: 0
  });

  const maxMonths = totalMonthsOriginal + 12;

  while (balance > 100 && currentMonth < maxMonths) {
    currentMonth++;
    
    // Obtener dato base correspondiente al mes actual (si existe)
    const baseData = scheduleBase[currentMonth - 1] || { balance: 0, interestaccum: totalInterestBase };

    let interest = balance * rateMonthly;
    let paymentExtra = extraMonthly;

    // Primas (Junio y Diciembre)
    if (usePrimas && (currentMonth % 12 === 6 || currentMonth % 12 === 0)) {
        paymentExtra += extraMonthly; 
    }
    // Pago único mes 1
    if (currentMonth === 1) paymentExtra += oneTimePayment;

    let paymentAvailable = pmtBase + paymentExtra;
    let capital = paymentAvailable - interest;

    // Ajuste si pagamos de más
    if (capital > balance) {
        capital = balance;
        paymentAvailable = capital + interest;
    }

    balance -= capital;
    totalInterest += interest;
    totalInsurance += insurance;

    schedule.push({
        month: currentMonth,
        paymentTotal: paymentAvailable + insurance,
        capital,
        interest,
        insurance,
        balance: balance > 0 ? balance : 0,
        extraApplied: paymentExtra
    });

    // Puntos para la gráfica (reducir densidad para mejor performance si es muy largo)
    if (currentMonth % 3 === 0 || balance <= 100 || currentMonth === 1) {
        graphData.push({
            mes: currentMonth,
            deudaBanco: Math.round(baseData.balance),
            deudaEstrategia: Math.round(balance > 0 ? balance : 0),
        });
    }
  }

  // Rellenar gráfica hasta el final del plan original para ver el espacio vacío (ahorro de tiempo)
  if (currentMonth < totalMonthsOriginal) {
      // Agregar un punto final para cerrar la visual
      graphData.push({
          mes: totalMonthsOriginal,
          deudaBanco: 0,
          deudaEstrategia: 0
      });
  }

  return {
    metrics: {
      originalTerm: totalMonthsOriginal,
      newTerm: schedule.length,
      monthsSaved: totalMonthsOriginal - schedule.length,
      interestSaved: totalInterestBase - totalInterest,
      totalPaymentOriginal: totalPaymentOriginal,
      totalPaymentNew: loanAmount + totalInterest + totalInsurance,
      monthlyObligatory: pmtTotalObligatory,
      monthlyTotalEffort: pmtTotalObligatory + extraMonthly, 
      effortIncreasePct: (extraMonthly / pmtTotalObligatory) * 100,
      timeReductionPct: ((totalMonthsOriginal - schedule.length) / totalMonthsOriginal) * 100
    },
    graphData,
    schedule
  };
};

// --- COMPONENTES DE VISTAS ---

const DashboardView = ({ metrics, graphData }) => {
    
    // Custom Tooltip para la gráfica
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const valBanco = payload[0].value;
            const valEstrategia = payload[1].value;
            const diff = valBanco - valEstrategia;
            
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-xs">
                    <p className="font-bold text-slate-700 mb-2">Mes {label}</p>
                    <div className="space-y-1">
                        <p className="text-slate-500">Banco: <span className="font-mono font-medium text-slate-700">{formatCOP(valBanco)}</span></p>
                        <p className="text-emerald-600">Estrategia: <span className="font-mono font-bold">{formatCOP(valEstrategia)}</span></p>
                        {diff > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-100 text-blue-600 font-bold">
                                Diferencia: {formatCOP(diff)}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Ahorro Intereses</p>
                        <h3 className="text-2xl font-extrabold text-emerald-600">{formatCOP(metrics.interestSaved)}</h3>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                        <Wallet size={14} className="mr-1.5" /> Dinero retenido
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Tiempo Ganado</p>
                        <h3 className="text-2xl font-extrabold text-blue-600">
                            {Math.floor(metrics.monthsSaved / 12)} <span className="text-lg text-slate-400">años</span> {metrics.monthsSaved % 12} <span className="text-lg text-slate-400">meses</span>
                        </h3>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium text-blue-700 bg-blue-50 w-fit px-2 py-1 rounded-full">
                        <Calendar size={14} className="mr-1.5" /> -{metrics.timeReductionPct.toFixed(1)}% del plazo
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total a Pagar</p>
                        <h3 className="text-2xl font-extrabold text-slate-700">{formatCOP(metrics.totalPaymentNew)}</h3>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded-full">
                        <DollarSign size={14} className="mr-1.5" /> Antes: <span className="line-through ml-1">{formatCOP(metrics.totalPaymentOriginal)}</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 rounded-2xl shadow-lg text-white flex flex-col justify-between">
                    <div>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">ROI Estrategia</p>
                        <h3 className="text-2xl font-extrabold text-white">Excelente</h3>
                    </div>
                    <div className="mt-4 text-xs text-indigo-100 leading-relaxed">
                        Por cada $1 extra, ahorras ${(metrics.interestSaved / (metrics.monthlyTotalEffort * metrics.newTerm - metrics.monthlyObligatory * metrics.newTerm) || 0).toFixed(1)} en intereses futuros.
                    </div>
                </div>
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-indigo-500"/>
                            Proyección de Libertad Financiera
                        </h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-slate-300 mr-2"></span> Banco</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Estrategia</div>
                        </div>
                    </div>
                    
                    <div className="h-80 w-full">
                        <ResponsiveContainer>
                            <AreaChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBanco" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorEstrategia" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="mes" 
                                    tick={{fontSize: 12, fill: '#64748b'}} 
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => val % 12 === 0 ? `${val/12}A` : val}
                                />
                                <YAxis 
                                    tickFormatter={(val) => `$${val/1000000}M`} 
                                    tick={{fontSize: 12, fill: '#64748b'}}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="deudaBanco" 
                                    stroke="#94a3b8" 
                                    strokeWidth={2}
                                    fill="url(#colorBanco)" 
                                    animationDuration={1000}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="deudaEstrategia" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    fill="url(#colorEstrategia)" 
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Resumen de Flujo */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-rose-500"/>
                        Impacto Mensual
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Pago Mínimo Banco</p>
                            <p className="text-2xl font-bold text-slate-700 mt-1">{formatCOP(metrics.monthlyObligatory)}</p>
                        </div>

                        <div className="flex justify-center text-slate-400">
                            <div className="bg-slate-100 rounded-full p-1"><ArrowRight size={16} className="rotate-90" /></div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <TrendingDown size={60} className="text-emerald-900"/>
                            </div>
                            <p className="text-xs font-semibold text-emerald-700 uppercase">Nuevo Aporte Total</p>
                            <p className="text-2xl font-bold text-emerald-800 mt-1">{formatCOP(metrics.monthlyTotalEffort)}</p>
                            <p className="text-xs text-emerald-600 mt-2 font-medium">
                                + {metrics.effortIncreasePct.toFixed(0)}% esfuerzo mensual
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-center text-slate-400">
                        Este incremento acelera tu salida de deudas exponencialmente.
                    </p>
                </div>
            </div>
        </div>
    );
};

const LegalGenerator = () => {
    const [type, setType] = useState("plazo"); 
    const letterRef = useRef(null);

    const handleCopy = () => {
        if (letterRef.current) {
            const text = letterRef.current.innerText;
            navigator.clipboard.writeText(text);
            // Aquí idealmente usarías un Toast, por ahora un alert sutil
            alert("Texto copiado. Pégalo en tu editor de texto favorito.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-amber-800 text-sm">Importante sobre la Ley 546 de 1999</h4>
                    <p className="text-amber-700 text-xs mt-1">
                        Los bancos están obligados a aceptar abonos a capital sin penalidad. Si eliges reducir plazo, tu cuota sigue igual pero terminas antes. Si reduces cuota, pagas lo mismo en tiempo pero mes a mes es más suave. <strong className="underline">La estrategia financiera recomienda reducir plazo.</strong>
                    </p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-slate-100 pb-6 gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Carta de Solicitud de Abono</h2>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setType("plazo")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${type === 'plazo' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Reducir Plazo
                        </button>
                        <button 
                            onClick={() => setType("cuota")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${type === 'cuota' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Reducir Cuota
                        </button>
                    </div>
                </div>

                <div ref={letterRef} className="font-serif text-slate-800 leading-relaxed max-w-[21cm] mx-auto bg-white min-h-[29.7cm] p-[2cm] shadow-sm border border-slate-100 relative text-justify text-sm sm:text-base">
                    {/* Marca de agua simulada */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-50 opacity-10 pointer-events-none rotate-45 text-6xl font-black">
                        BORRADOR
                    </div>

                    <p className="text-right mb-12">Ciudad y Fecha: _________________</p>
                    
                    <p className="mb-8">
                        Señores<br/>
                        <strong>Dpto. de Cartera / Servicio al Cliente</strong><br/>
                        [NOMBRE DEL BANCO]<br/>
                        E. S. D.
                    </p>
                    
                    <p className="mb-8">
                        <strong>Referencia:</strong> Solicitud irrevocable de aplicación de prepago a capital.<br/>
                        <strong>Crédito Hipotecario No:</strong> _________________
                    </p>
                    
                    <p className="mb-6">
                        Respetados señores:
                    </p>

                    <p className="mb-6">
                        En mi calidad de titular de la obligación de la referencia, y obrando de conformidad con lo establecido en el <strong>Artículo 17, Numeral 8 de la Ley 546 de 1999</strong> (Ley de Vivienda), comedidamente informo que he realizado un abono extraordinario a mi crédito.
                    </p>
                    
                    <div className={`my-8 p-4 border-l-4 italic bg-slate-50 ${type === 'plazo' ? 'border-emerald-500' : 'border-blue-500'}`}>
                        {type === 'plazo' 
                            ? "SOLICITO EXPLÍCITAMENTE que este dinero sea aplicado integralmente a la disminución del saldo de CAPITAL, con el objetivo de REDUCIR EL PLAZO (tiempo) total de la obligación, manteniendo el valor de la cuota mensual actual."
                            : "SOLICITO EXPLÍCITAMENTE que este dinero sea aplicado integralmente a la disminución del saldo de CAPITAL, con el objetivo de REDUCIR EL VALOR DE LA CUOTA MENSUAL, manteniendo el plazo restante pactado."
                        }
                    </div>
                    
                    <p className="mb-6">
                        Agradezco confirmar la aplicación de este pago bajo las condiciones descritas y generar el nuevo plan de pagos actualizado.
                    </p>
                    
                    <p className="mt-12">Cordialmente,</p>
                    <br/><br/>
                    <div className="border-t border-slate-800 w-64 pt-2">
                        <p>Firma: __________________________</p>
                        <p>C.C. __________________________</p>
                        <p>Tel: __________________________</p>
                    </div>
                </div>

                <div className="mt-8 flex gap-4 justify-center">
                    <button 
                        onClick={handleCopy}
                        className="flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-200"
                    >
                        <FileText className="w-4 h-4 mr-2" /> Copiar Texto
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- APP PRINCIPAL ---

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estado de inputs
  const [inputs, setInputs] = useState({
    loanAmount: 200000000,
    rateEA: 13.5,
    years: 20,
    insurance: 85000,
    extraMonthly: 500000,
    oneTimePayment: 0,
    usePrimas: true 
  });

  // Estado para IA
  const [aiReport, setAiReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Debouncing para inputs que disparan cálculos pesados
  const debouncedInputs = useDebounce(inputs, 400);

  // Memoizar resultados
  const results = useMemo(() => {
    return calculateEngine(debouncedInputs);
  }, [debouncedInputs]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    if(activeTab === 'advisor') setAiReport(null); // Limpiar reporte si cambian datos
  };

  const handleGenerateReport = async () => {
    if (!results) return;
    
    setIsGeneratingReport(true);
    
    // Prompt optimizado para asesoría financiera colombiana
    const prompt = `Actúa como un experto financiero hipotecario en Colombia. Analiza el siguiente escenario de optimización de crédito y genera un reporte estratégico breve pero contundente:

    DATOS DEL USUARIO:
    - Deuda Inicial: ${formatCOP(inputs.loanAmount)}
    - Tasa Actual: ${inputs.rateEA}% E.A.
    - Plazo Original: ${inputs.years} años
    - Estrategia (Abono Extra): ${formatCOP(inputs.extraMonthly)} mensuales
    - ¿Usa Primas?: ${inputs.usePrimas ? "SÍ" : "NO"}

    RESULTADOS DE LA SIMULACIÓN:
    - Ahorro Total Proyectado: ${formatCOP(results.metrics.interestSaved)} (Intereses no pagados)
    - Tiempo Eliminado: ${results.metrics.monthsSaved} meses (${(results.metrics.monthsSaved / 12).toFixed(1)} años)
    - Nuevo Plazo Total: ${(results.metrics.newTerm / 12).toFixed(1)} años
    - ROI (Retorno sobre esfuerzo): Por cada peso extra abonado, se ahorran intereses.

    INSTRUCCIONES DE RESPUESTA:
    1. Empieza con una frase impactante sobre el ahorro logrado.
    2. Explica brevemente el "Efecto Bola de Nieve" aplicado a este caso.
    3. Si la tasa es > 14%, sugiere IMPERATIVAMENTE la compra de cartera (menciona bancos colombianos genéricamente como opción).
    4. Da un consejo motivacional para mantener la disciplina de pago.
    5. Usa formato Markdown simple (negritas, listas) y emojis financieros (💰, 📉, 🚀).
    6. Sé conciso. No más de 200 palabras.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            setAiReport(data.candidates[0].content.parts[0].text);
        } else {
            setAiReport("Hubo un error interpretando la respuesta del asesor inteligente. Intenta nuevamente.");
        }
    } catch (error) {
        console.error("Error llamando a Gemini:", error);
        setAiReport("Error de conexión. Por favor verifica tu conexión a internet e intenta nuevamente.");
    } finally {
        setIsGeneratingReport(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Tablero Principal', icon: PieChart },
    { id: 'advisor', label: 'Análisis IA', icon: BrainCircuit },
    { id: 'schedule', label: 'Tabla Detallada', icon: List },
    { id: 'legal', label: 'Generador Legal', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex overflow-hidden">
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-30 transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <TrendingDown size={20} className="text-white" />
            </div>
            <div>
                <h1 className="font-bold text-lg leading-none text-slate-900">CrediMaster</h1>
                <span className="text-xs text-blue-600 font-bold tracking-widest uppercase">Ultra</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X size={24} />
          </button>
        </div>
        
        <div className="p-4 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
            {/* Navigation */}
            <nav className="space-y-1">
                {navItems.map((item) => (
                    <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === item.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    >
                    <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                    {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-50"/>}
                    </button>
                ))}
            </nav>

            {/* Input Form Area in Sidebar (Visible on Desktop) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
                <p className="px-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Parámetros del Crédito</p>
                <div className="space-y-4 px-1">
                    <NumericInput 
                        label="Saldo Deuda" 
                        value={inputs.loanAmount} 
                        onChange={(v) => handleInputChange('loanAmount', v)} 
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <NumericInput 
                            label="Tasa E.A." 
                            type="percent"
                            value={inputs.rateEA} 
                            onChange={(v) => handleInputChange('rateEA', v)} 
                        />
                         <NumericInput 
                            label="Plazo (Años)" 
                            type="number"
                            value={inputs.years} 
                            onChange={(v) => handleInputChange('years', v)} 
                        />
                    </div>
                    <NumericInput 
                        label="Seguros Mensual" 
                        value={inputs.insurance} 
                        onChange={(v) => handleInputChange('insurance', v)} 
                    />
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-4">
                     <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center">
                        <Wallet size={12} className="mr-1"/> Tu Estrategia
                     </p>
                     <NumericInput 
                        label="Abono Extra Mensual" 
                        value={inputs.extraMonthly} 
                        onChange={(v) => handleInputChange('extraMonthly', v)} 
                        className="[&_input]:bg-white [&_input]:border-emerald-200 [&_input]:text-emerald-800"
                    />
                     <ToggleSwitch 
                        label={<span className="text-xs font-semibold text-slate-600">Usar Primas (Jun/Dic) <br/><span className="text-[10px] text-slate-400 font-normal">Duplica el abono extra</span></span>}
                        checked={inputs.usePrimas}
                        onChange={(v) => handleInputChange('usePrimas', v)}
                    />
                     <NumericInput 
                        label="Abono Único (Inicio)" 
                        value={inputs.oneTimePayment} 
                        onChange={(v) => handleInputChange('oneTimePayment', v)} 
                    />
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
             <div className="font-bold text-slate-800">Resumen</div>
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <Menu size={20} />
             </button>
        </header>

        <div className="p-4 md:p-8 md:max-w-7xl md:mx-auto">
            {!results ? (
                 <div className="flex flex-col items-center justify-center h-96 text-center text-slate-400">
                    <AlertTriangle size={48} className="mb-4 text-amber-400 opacity-50" />
                    <p className="text-lg font-medium text-slate-600">Faltan datos</p>
                    <p>Configura tu crédito en el menú lateral para comenzar.</p>
                 </div>
            ) : (
                <>
                    {activeTab === 'dashboard' && <DashboardView metrics={results.metrics} graphData={results.graphData} />}
                    
                    {activeTab === 'advisor' && (
                         <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-12">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                                <BrainCircuit className="mr-3 text-purple-600"/> Análisis Inteligente
                            </h2>
                            
                            {/* Static Advice Cards */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-lg mb-4 text-slate-800">Diagnóstico Preliminar</h3>
                                <ul className="space-y-4">
                                    {inputs.rateEA > 16 && (
                                        <li className="flex gap-4 p-4 bg-rose-50 rounded-xl border border-rose-100">
                                            <AlertTriangle className="text-rose-500 shrink-0" />
                                            <div>
                                                <p className="font-bold text-rose-800 text-sm">Alerta Crítica: Tasa de Interés</p>
                                                <p className="text-sm text-rose-700 mt-1">Tu tasa del {inputs.rateEA}% está fuera del mercado competitivo actual. Antes de abonar capital, prioriza una compra de cartera. Meta: 10% - 12% E.A.</p>
                                            </div>
                                        </li>
                                    )}
                                    <li className="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <Info className="text-blue-500 shrink-0" />
                                        <div>
                                            <p className="font-bold text-blue-800 text-sm">Eficiencia del Abono</p>
                                            <p className="text-sm text-blue-700 mt-1">Con tu abono de {formatCOP(inputs.extraMonthly)}, estás reduciendo {results.metrics.monthsSaved} meses de deuda. Es una inversión libre de riesgo.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Gemini AI Integration Section */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl shadow-xl text-white">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                                            <Sparkles className="w-8 h-8 text-yellow-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Asesor Financiero IA ✨</h3>
                                            <p className="text-indigo-200 text-sm max-w-lg">
                                                Utiliza nuestra inteligencia artificial avanzada para generar un reporte personalizado basado en tus números exactos. Obtén estrategias de expertos al instante.
                                            </p>
                                        </div>
                                    </div>

                                    {!aiReport ? (
                                        <button 
                                            onClick={handleGenerateReport}
                                            disabled={isGeneratingReport}
                                            className="group flex items-center px-6 py-4 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isGeneratingReport ? (
                                                <>
                                                    <Bot className="w-5 h-5 mr-3 animate-bounce" />
                                                    Analizando tu caso...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5 mr-3 text-yellow-500 group-hover:rotate-12 transition-transform" />
                                                    Generar Reporte Personalizado
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                            <div className="prose prose-invert prose-sm max-w-none text-indigo-50 leading-relaxed whitespace-pre-line">
                                                {aiReport}
                                            </div>
                                            <button 
                                                onClick={handleGenerateReport} 
                                                className="mt-6 text-xs text-indigo-300 hover:text-white flex items-center font-medium transition-colors"
                                            >
                                                <Sparkles className="w-3 h-3 mr-1" /> Regenerar análisis
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
                             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Tabla de Amortización Proyectada</h3>
                                <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-medium">
                                    {results.schedule.length} Meses
                                </span>
                             </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Mes</th>
                                            <th className="px-6 py-3 font-semibold text-right">Cuota Total</th>
                                            <th className="px-6 py-3 font-semibold text-right">Abono Extra</th>
                                            <th className="px-6 py-3 font-semibold text-right text-emerald-600">Capital</th>
                                            <th className="px-6 py-3 font-semibold text-right text-rose-500">Interés</th>
                                            <th className="px-6 py-3 font-semibold text-right">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {results.schedule.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-slate-900">{row.month}</td>
                                                <td className="px-6 py-3 text-right font-medium">{formatCOP(row.paymentTotal)}</td>
                                                <td className="px-6 py-3 text-right text-slate-500">{row.extraApplied > 0 ? formatCOP(row.extraApplied) : '-'}</td>
                                                <td className="px-6 py-3 text-right text-emerald-600 font-medium">{formatCOP(row.capital)}</td>
                                                <td className="px-6 py-3 text-right text-rose-500">{formatCOP(row.interest)}</td>
                                                <td className="px-6 py-3 text-right font-bold text-slate-700">{formatCOP(row.balance)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    )}

                    {activeTab === 'legal' && <LegalGenerator />}
                </>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;
