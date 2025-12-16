import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PieChart, DollarSign, Calendar, AlertTriangle, ArrowRight, 
  Menu, X, BrainCircuit, Wallet, Target, BarChart3, ShieldCheck, 
  List, ChevronRight, Info, Printer, Sparkles, Bot, Settings, 
  FileText, TrendingDown, Share2, Copy, Calculator, PiggyBank,
  Coffee, Home, Car, ShoppingBag, Zap
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell, Pie, PieChart as RechartsPieChart
} from 'recharts';

// --- CONFIGURACIÓN ---
const apiKey = ""; 

// --- UTILIDADES ---
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

// Hook debounce para optimizar rendimiento
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

// --- COMPONENTES UI GENÉRICOS ---

const NumericInput = ({ label, value, onChange, type = 'currency', className = '', icon: Icon }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Sincronizar estado externo con visualización interna
  useEffect(() => {
    if (value === '' || value === null) {
        setDisplayValue('');
        return;
    }
    
    if (type === 'percent') {
        setDisplayValue(value.toString().replace('.', ','));
    } else {
        setDisplayValue(formatNumber(value));
    }
  }, [value, type]);

  const handleChange = (e) => {
    let inputValue = e.target.value;

    if (type === 'percent') {
        inputValue = inputValue.replace(/[^0-9,]/g, '');
        const parts = inputValue.split(',');
        if (parts.length > 2) {
            inputValue = parts[0] + ',' + parts.slice(1).join('');
        }
        setDisplayValue(inputValue);
        if (inputValue === '' || inputValue === ',') {
            onChange(0);
        } else {
            const numericValue = parseFloat(inputValue.replace(',', '.'));
            if (!isNaN(numericValue)) {
                onChange(numericValue);
            }
        }
    } else {
        const rawVal = inputValue.replace(/\./g, '').replace(/,/g, ''); 
        if (rawVal === '') {
            setDisplayValue('');
            onChange(0);
            return;
        }
        if (!isNaN(rawVal)) {
            const numberVal = parseInt(rawVal, 10);
            setDisplayValue(formatNumber(numberVal)); 
            onChange(numberVal); 
        }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex flex-wrap justify-between gap-1 items-center">
            <span className="flex items-center gap-1.5">
                {Icon && <Icon size={14} className="text-slate-400" />}
                {label}
            </span>
            {type === 'percent' && <span className="text-slate-400 font-normal whitespace-nowrap">% E.A.</span>}
        </label>
        <div className="relative group">
            {type === 'currency' && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-semibold group-focus-within:text-blue-500 transition-colors">$</span>
                </div>
            )}
            <input
                type="text"
                inputMode={type === 'percent' ? "decimal" : "numeric"}
                value={displayValue}
                onChange={handleChange}
                className={`block w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white shadow-sm transition-all outline-none border ${type === 'currency' ? 'pl-7' : ''}`}
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
    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onChange(!checked)}>
        <div className="text-sm font-medium text-slate-700 leading-tight select-none pr-2">
            {label}
        </div>
        <div 
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </div>
    </div>
);

// Componente reutilizable de Inputs
const CreditParametersForm = ({ inputs, handleInputChange, className = "" }) => (
    <div className={`space-y-6 ${className}`}>
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Settings size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Datos del Crédito</h3>
            </div>
            
            <NumericInput 
                label="Saldo Deuda Actual" 
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
                    label="Plazo (Meses)" 
                    type="currency" 
                    value={inputs.months} 
                    onChange={(v) => handleInputChange('months', v)} 
                />
            </div>
            <NumericInput 
                label="Seguros / Otros (Mensual)" 
                value={inputs.insurance} 
                onChange={(v) => handleInputChange('insurance', v)} 
            />
        </div>

        <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-100 space-y-4 shadow-sm">
             <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Wallet size={16} />
                </div>
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Tu Estrategia</h3>
            </div>
             <NumericInput 
                label="Abono Extra Mensual" 
                value={inputs.extraMonthly} 
                onChange={(v) => handleInputChange('extraMonthly', v)} 
                className="[&_input]:bg-white [&_input]:border-emerald-200 [&_input]:text-emerald-800 [&_input]:focus:ring-emerald-200 [&_input]:focus:border-emerald-500"
            />
             <ToggleSwitch 
                label={<span className="text-xs font-semibold text-slate-600 block">Usar Primas (Jun/Dic) <span className="text-[10px] text-slate-400 font-normal block mt-0.5">Duplica el abono extra</span></span>}
                checked={inputs.usePrimas}
                onChange={(v) => handleInputChange('usePrimas', v)}
            />
             <NumericInput 
                label="Abono Único Inicial" 
                value={inputs.oneTimePayment} 
                onChange={(v) => handleInputChange('oneTimePayment', v)} 
            />
        </div>
    </div>
);

// --- LÓGICA DE NEGOCIO ---

const calculateEngine = (params) => {
  const { loanAmount, rateEA, months, insurance, extraMonthly, usePrimas, oneTimePayment } = params;
  
  if (!loanAmount || !rateEA || !months) return null;

  const rateMonthly = Math.pow(1 + rateEA / 100, 1 / 12) - 1;
  const totalMonthsOriginal = months; 

  const pmtBase = loanAmount * (rateMonthly * Math.pow(1 + rateMonthly, totalMonthsOriginal)) / (Math.pow(1 + rateMonthly, totalMonthsOriginal) - 1);
  const pmtTotalObligatory = pmtBase + insurance;

  let balanceBase = loanAmount;
  let totalInterestBase = 0;
  const scheduleBase = [];

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

  let schedule = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let totalInsurance = 0;
  let currentMonth = 0;
  
  const graphData = [];
  graphData.push({
      mes: 0,
      deudaBanco: loanAmount,
      deudaEstrategia: loanAmount,
  });

  const maxMonths = totalMonthsOriginal + 12;

  while (balance > 100 && currentMonth < maxMonths) {
    currentMonth++;
    const baseData = scheduleBase[currentMonth - 1] || { balance: 0 };
    let interest = balance * rateMonthly;
    let paymentExtra = extraMonthly;

    if (usePrimas && (currentMonth % 12 === 6 || currentMonth % 12 === 0)) paymentExtra += extraMonthly; 
    if (currentMonth === 1) paymentExtra += oneTimePayment;

    let paymentAvailable = pmtBase + paymentExtra;
    let capital = paymentAvailable - interest;

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

    if (currentMonth % 3 === 0 || balance <= 100 || currentMonth === 1) {
        graphData.push({
            mes: currentMonth,
            deudaBanco: Math.round(baseData.balance),
            deudaEstrategia: Math.round(balance > 0 ? balance : 0),
        });
    }
  }

  if (currentMonth < totalMonthsOriginal) {
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

// --- VISTAS ---

const BudgetView = ({ onApplyExtra }) => {
    const [finances, setFinances] = useState({
        income: 5000000,
        housing: 1200000,
        food: 800000,
        transport: 400000,
        utilities: 300000,
        entertainment: 300000,
        others: 200000
    });

    const totalExpenses = finances.housing + finances.food + finances.transport + finances.utilities + finances.entertainment + finances.others;
    const surplus = finances.income - totalExpenses;
    const recommendedExtra = Math.max(0, surplus * 0.7); // Recomendamos usar el 70% del excedente

    const handleChange = (field, value) => {
        setFinances(prev => ({ ...prev, [field]: value }));
    };

    const dataPie = [
        { name: 'Vivienda', value: finances.housing, color: '#3b82f6' },
        { name: 'Alimentación', value: finances.food, color: '#10b981' },
        { name: 'Transporte', value: finances.transport, color: '#f59e0b' },
        { name: 'Servicios', value: finances.utilities, color: '#6366f1' },
        { name: 'Ocio', value: finances.entertainment, color: '#ec4899' },
        { name: 'Otros', value: finances.others, color: '#94a3b8' },
    ].filter(item => item.value > 0);

    return (
        <div className="space-y-6 pb-24 lg:pb-0 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Estudio Financiero</h2>
                    <p className="text-blue-200 text-sm max-w-xl">
                        Analiza tus ingresos y gastos para descubrir cuánto puedes realmente abonar a tu deuda sin asfixiarte.
                    </p>
                </div>
                <div className="absolute right-0 top-0 opacity-10 p-4">
                    <Calculator size={100} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Inputs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center">
                            <Wallet size={16} className="mr-2 text-emerald-600"/> Ingresos Mensuales
                        </h3>
                        <NumericInput 
                            label="Total Ingresos (Neto)" 
                            value={finances.income} 
                            onChange={(v) => handleChange('income', v)} 
                        />
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center">
                            <ShoppingBag size={16} className="mr-2 text-rose-500"/> Gastos Mensuales
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <NumericInput label="Vivienda" icon={Home} value={finances.housing} onChange={(v) => handleChange('housing', v)} />
                            <NumericInput label="Alimentación" icon={Coffee} value={finances.food} onChange={(v) => handleChange('food', v)} />
                            <NumericInput label="Transporte" icon={Car} value={finances.transport} onChange={(v) => handleChange('transport', v)} />
                            <NumericInput label="Servicios" icon={Zap} value={finances.utilities} onChange={(v) => handleChange('utilities', v)} />
                            <NumericInput label="Ocio / Varios" icon={Sparkles} value={finances.entertainment} onChange={(v) => handleChange('entertainment', v)} />
                            <NumericInput label="Deudas / Otros" icon={CreditCardIcon} value={finances.others} onChange={(v) => handleChange('others', v)} />
                        </div>
                    </div>
                </div>

                {/* Columna Resultados */}
                <div className="space-y-6">
                     {/* Resumen */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-6">Diagnóstico de Flujo de Caja</h3>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                             <div className="w-40 h-40 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={dataPie}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {dataPie.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCOP(value)} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-xs font-bold text-slate-400">Gastos</span>
                                </div>
                             </div>

                             <div className="flex-1 space-y-3 w-full">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-600 font-medium">Ingresos</span>
                                    <span className="font-bold text-slate-800">{formatCOP(finances.income)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100">
                                    <span className="text-sm text-rose-700 font-medium">Gastos Totales</span>
                                    <span className="font-bold text-rose-800">-{formatCOP(totalExpenses)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <span className="text-sm text-emerald-700 font-bold">Disponible Real</span>
                                    <span className="font-bold text-emerald-800 text-lg">{formatCOP(surplus)}</span>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Recomendación y Acción */}
                    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-md border border-indigo-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-indigo-900 mb-2 flex items-center">
                                <Target className="w-5 h-5 mr-2 text-indigo-600"/>
                                Potencial de Aceleración
                            </h3>
                            <p className="text-sm text-indigo-800/80 mb-6 leading-relaxed">
                                Tienes un excedente de <strong>{formatCOP(surplus)}</strong>. Recomendamos destinar el 70% a tu deuda y guardar el 30% para imprevistos.
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-xs font-bold text-indigo-400 uppercase">Abono Sugerido</span>
                                    <span className="text-3xl font-black text-indigo-600">{formatCOP(recommendedExtra)}</span>
                                </div>
                                
                                <button 
                                    onClick={() => onApplyExtra(recommendedExtra)}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center"
                                >
                                    <Zap className="w-5 h-5 mr-2 fill-current" />
                                    Aplicar esta cantidad al Simulador
                                </button>
                                <p className="text-[10px] text-center text-indigo-400 mt-2">
                                    Al hacer clic, se actualizará el valor de "Abono Extra Mensual" en la configuración.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Icono auxiliar para input
const CreditCardIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
);

const DashboardView = ({ metrics, graphData }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 shadow-xl rounded-xl text-xs z-50">
                    <p className="font-bold text-slate-700 mb-2">Mes {label}</p>
                    <div className="space-y-1">
                        <p className="text-slate-500">Banco: <span className="font-mono font-medium text-slate-700">{formatCOP(payload[0].value)}</span></p>
                        <p className="text-emerald-600">Estrategia: <span className="font-mono font-bold">{formatCOP(payload[1].value)}</span></p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-20 lg:pb-0 animate-in fade-in duration-500">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Ahorro */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Wallet size={80} className="text-emerald-600"/>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Ahorro Intereses</p>
                        <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-600 tracking-tight break-words">{formatCOP(metrics.interestSaved)}</h3>
                    </div>
                    <div className="mt-auto pt-4 flex items-center w-full">
                        <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 flex items-center w-full">
                            <TrendingDown size={14} className="mr-1.5 shrink-0" /> 
                            <span className="truncate">Dinero ahorrado</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: Tiempo */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Calendar size={80} className="text-blue-600"/>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Tiempo Ganado</p>
                        <h3 className="text-2xl lg:text-3xl font-extrabold text-blue-600 tracking-tight flex flex-wrap gap-x-2 items-baseline">
                            <span>{Math.floor(metrics.monthsSaved / 12)} <span className="text-lg text-slate-400 font-semibold">años</span></span>
                            <span>{metrics.monthsSaved % 12} <span className="text-lg text-slate-400 font-semibold">meses</span></span>
                        </h3>
                    </div>
                    <div className="mt-auto pt-4 flex items-center w-full">
                        <div className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center w-full">
                            <Target size={14} className="mr-1.5 shrink-0" /> 
                            <span className="truncate">-{metrics.timeReductionPct.toFixed(0)}% del plazo total</span>
                        </div>
                    </div>
                </div>

                {/* Card 3: Total */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px]">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total a Pagar</p>
                        <h3 className="text-2xl font-extrabold text-slate-700 break-words">{formatCOP(metrics.totalPaymentNew)}</h3>
                    </div>
                    <div className="mt-auto pt-4 flex items-center w-full">
                         <div className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center w-full">
                            <DollarSign size={14} className="mr-1.5 shrink-0" /> 
                            <span className="truncate">Antes: <span className="line-through decoration-rose-400">{formatCOP(metrics.totalPaymentOriginal)}</span></span>
                        </div>
                    </div>
                </div>

                {/* Card 4: CTA / Advice */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden min-h-[160px]">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                    <div>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">Impacto Estrategia</p>
                        <div className="flex items-baseline gap-2">
                             <h3 className="text-2xl font-extrabold text-white">Excelente</h3>
                             <span className="text-sm text-yellow-300 font-medium">★★★★★</span>
                        </div>
                    </div>
                    <div className="mt-auto pt-4 text-xs text-indigo-50 leading-relaxed font-medium border-t border-white/10">
                        Por cada $1,000 extra, ahorras ${(metrics.interestSaved / (metrics.monthlyTotalEffort * metrics.newTerm - metrics.monthlyObligatory * metrics.newTerm) * 1000 || 0).toFixed(0)} en intereses futuros.
                    </div>
                </div>
            </div>

            {/* Gráfica */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                    <h3 className="font-bold text-slate-800 flex items-center text-lg">
                        <BarChart3 className="w-5 h-5 mr-2 text-indigo-500"/>
                        Proyección de Libertad
                    </h3>
                    <div className="flex gap-4 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-2"></span> Banco</div>
                        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span> Estrategia</div>
                    </div>
                </div>
                
                <div className="h-64 sm:h-80 w-full -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBanco" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorEstrategia" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="mes" 
                                tick={{fontSize: 10, fill: '#94a3b8'}} 
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => val % 24 === 0 ? `${val/12}A` : ''} 
                            />
                            <YAxis 
                                tickFormatter={(val) => `${val/1000000}M`} 
                                tick={{fontSize: 10, fill: '#94a3b8'}}
                                axisLine={false}
                                tickLine={false}
                                width={40}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="deudaBanco" 
                                stroke="#94a3b8" 
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                fill="url(#colorBanco)" 
                                animationDuration={1000}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="deudaEstrategia" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                fill="url(#colorEstrategia)" 
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
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
            alert("Texto copiado al portapapeles");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-0 animate-in fade-in">
             <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                    <h4 className="font-bold text-amber-800 text-sm">Ley de Vivienda 546 de 1999</h4>
                    <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                        En Colombia, los bancos <strong>deben aceptar abonos a capital</strong> sin penalidad. La opción inteligente es reducir plazo: pagas la misma cuota pero terminas mucho antes.
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-slate-800">Generador de Solicitud</h2>
                    <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                        <button 
                            onClick={() => setType("plazo")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${type === 'plazo' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Reducir Plazo
                        </button>
                        <button 
                            onClick={() => setType("cuota")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${type === 'cuota' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Reducir Cuota
                        </button>
                    </div>
                </div>

                {/* Contenedor con scroll para simular papel en móvil */}
                <div className="overflow-x-auto bg-slate-50 rounded-xl p-2 md:p-0 md:bg-transparent mb-6 border border-slate-100 md:border-0">
                    <div ref={letterRef} className="font-serif text-slate-800 leading-relaxed min-w-[600px] md:min-w-0 md:max-w-[21cm] mx-auto bg-white min-h-[20cm] p-[2cm] shadow-sm md:border border-slate-100 relative text-justify text-sm">
                        <p className="text-right mb-8">Ciudad y Fecha: _________________</p>
                        
                        <p className="mb-6">
                            Señores<br/>
                            <strong>Dpto. de Cartera / Servicio al Cliente</strong><br/>
                            [NOMBRE DEL BANCO]<br/>
                            E. S. D.
                        </p>
                        
                        <p className="mb-6">
                            <strong>Referencia:</strong> Solicitud irrevocable de aplicación de prepago a capital.<br/>
                            <strong>Crédito Hipotecario No:</strong> _________________
                        </p>
                        
                        <p className="mb-4">Respetados señores:</p>

                        <p className="mb-4">
                            En mi calidad de titular de la obligación de la referencia, y amparado en la <strong>Ley 546 de 1999</strong>, informo que he realizado un abono extraordinario.
                        </p>
                        
                        <div className={`my-6 p-4 border-l-4 italic bg-slate-50 ${type === 'plazo' ? 'border-emerald-500' : 'border-blue-500'}`}>
                            {type === 'plazo' 
                                ? "SOLICITO que este dinero se aplique a capital para REDUCIR EL PLAZO (tiempo), manteniendo la cuota mensual actual."
                                : "SOLICITO que este dinero se aplique a capital para REDUCIR EL VALOR DE LA CUOTA, manteniendo el plazo actual."
                            }
                        </div>
                        
                        <p className="mt-8">Cordialmente,</p>
                        <br/><br/>
                        <div className="border-t border-slate-800 w-48 pt-2">
                            <p>Firma: ___________________</p>
                            <p>C.C. ___________________</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleCopy} className="flex items-center justify-center px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium">
                        <Copy className="w-4 h-4 mr-2" /> Copiar
                    </button>
                    <button onClick={() => window.print()} className="flex items-center justify-center px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium">
                        <Printer className="w-4 h-4 mr-2" /> Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- APP SHELL ---

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inputs, setInputs] = useState({
    loanAmount: 180000000,
    rateEA: 13.5,
    months: 240, // Ahora por defecto en meses (20 años)
    insurance: 65000,
    extraMonthly: 400000,
    oneTimePayment: 0,
    usePrimas: true 
  });
  const [aiReport, setAiReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const debouncedInputs = useDebounce(inputs, 300);
  const results = useMemo(() => calculateEngine(debouncedInputs), [debouncedInputs]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    if(activeTab === 'advisor') setAiReport(null);
  };

  const handleApplyBudget = (amount) => {
      setInputs(prev => ({...prev, extraMonthly: Math.round(amount)}));
      setActiveTab('dashboard');
      // Podrías añadir un pequeño toast/notificación aquí
      alert(`¡Estrategia Actualizada! Se ha configurado un abono mensual de ${formatCOP(amount)}.`);
  };

  const handleGenerateReport = async () => {
    if (!results) return;
    setIsGeneratingReport(true);
    const prompt = `Eres un asesor financiero experto en Colombia. Analiza: Crédito ${formatCOP(inputs.loanAmount)}, Tasa ${inputs.rateEA}% EA, Plazo ${inputs.months} cuotas. Estrategia: Abono ${formatCOP(inputs.extraMonthly)}/mes. Resultado: Ahorra ${formatCOP(results.metrics.interestSaved)} y reduce ${results.metrics.monthsSaved} meses. Dame 3 consejos breves y motivadores en lista Markdown.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        setAiReport(data.candidates?.[0]?.content?.parts?.[0]?.text || "Intenta de nuevo.");
    } catch (e) {
        setAiReport("Error de conexión. Intenta más tarde.");
    } finally {
        setIsGeneratingReport(false);
    }
  };

  const renderContent = () => {
      if (!results) return <div className="p-10 text-center text-slate-400">Cargando motor financiero...</div>;

      switch(activeTab) {
        case 'dashboard': return <DashboardView metrics={results.metrics} graphData={results.graphData} />;
        case 'budget': return <BudgetView onApplyExtra={handleApplyBudget} />;
        case 'advisor': 
            return (
                <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-0 animate-in fade-in">
                    <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="text-yellow-300 w-6 h-6" />
                                <h2 className="text-xl md:text-2xl font-bold">IA Financial Advisor</h2>
                            </div>
                            
                            {!aiReport ? (
                                <div className="text-center py-8">
                                    <p className="text-indigo-200 mb-6">Analiza tu caso específico y recibe recomendaciones de expertos.</p>
                                    <button 
                                        onClick={handleGenerateReport}
                                        disabled={isGeneratingReport}
                                        className="w-full bg-white text-indigo-900 font-bold py-3 px-6 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {isGeneratingReport ? <Bot className="animate-bounce w-5 h-5"/> : <BrainCircuit className="w-5 h-5"/>}
                                        {isGeneratingReport ? "Analizando..." : "Generar Diagnóstico"}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-md border border-white/10">
                                    <div className="prose prose-invert prose-sm max-w-none">{aiReport}</div>
                                    <button onClick={() => setAiReport(null)} className="mt-4 text-xs text-indigo-300 underline">Nuevo análisis</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        case 'schedule':
            return (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden pb-20 lg:pb-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3">Mes</th>
                                    <th className="px-4 py-3 text-right">Cuota</th>
                                    <th className="px-4 py-3 text-right text-emerald-600">Extra</th>
                                    <th className="px-4 py-3 text-right text-rose-500">Interés</th>
                                    <th className="px-4 py-3 text-right">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {results.schedule.map((row) => (
                                    <tr key={row.month} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{row.month}</td>
                                        <td className="px-4 py-3 text-right">{formatCOP(row.paymentTotal)}</td>
                                        <td className="px-4 py-3 text-right text-emerald-600">{row.extraApplied > 0 ? `+${formatCOP(row.extraApplied)}` : '-'}</td>
                                        <td className="px-4 py-3 text-right text-rose-500">{formatCOP(row.interest)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-700">{formatCOP(row.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        case 'settings': // Solo móvil
            return (
                <div className="pb-24 animate-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 px-1">Configuración del Crédito</h2>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <CreditParametersForm inputs={inputs} handleInputChange={handleInputChange} />
                    </div>
                </div>
            );
        case 'legal': return <LegalGenerator />;
        default: return null;
      }
  };

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: PieChart },
    { id: 'budget', label: 'Estudio Financiero', icon: Calculator },
    { id: 'schedule', label: 'Tabla', icon: List },
    { id: 'advisor', label: 'IA Asesor', icon: BrainCircuit },
    { id: 'legal', label: 'Legal', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col lg:flex-row overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-200 h-screen overflow-y-auto fixed left-0 top-0 z-30 shadow-xl lg:shadow-none">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200/50">
              <TrendingDown size={24} className="text-white" />
            </div>
            <div>
                <h1 className="font-bold text-xl leading-none text-slate-900 tracking-tight">CrediMaster</h1>
                <span className="text-[10px] text-blue-600 font-bold tracking-[0.2em] uppercase">Pro</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-8">
            <nav className="space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            activeTab === item.id 
                            ? 'bg-blue-50 text-blue-700 shadow-sm' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <item.icon size={20} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} />
                        <span>{item.label}</span>
                        {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-50"/>}
                    </button>
                ))}
            </nav>
            
            <div className="pt-6 border-t border-slate-100">
                <CreditParametersForm inputs={inputs} handleInputChange={handleInputChange} />
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 lg:ml-80 h-screen overflow-y-auto bg-slate-50/50">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 lg:hidden flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <TrendingDown size={16} className="text-white" />
                </div>
                <span className="font-bold text-slate-800">CrediMaster</span>
             </div>
             <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                v2.0
             </div>
        </header>

        <div className="p-4 md:p-8 md:max-w-6xl md:mx-auto">
            {renderContent()}
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 pb-safe px-2 py-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                        activeTab === item.id ? 'text-blue-600' : 'text-slate-400'
                    }`}
                >
                    <div className={`p-1 rounded-full mb-1 transition-all ${activeTab === item.id ? 'bg-blue-50 transform -translate-y-1' : ''}`}>
                         <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium">{item.label}</span>
                </button>
            ))}
             <button
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                    activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'
                }`}
            >
                <div className={`p-1 rounded-full mb-1 transition-all ${activeTab === 'settings' ? 'bg-emerald-50 transform -translate-y-1' : ''}`}>
                        <Settings size={20} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">Ajustes</span>
            </button>
        </div>
      </nav>

    </div>
  );
};

export default App;
