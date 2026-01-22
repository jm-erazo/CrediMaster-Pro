// ============================================================================
// CREDIMASTER PRO V4.0 - PARTE 1/7
// Imports, Sistema de Notificaciones y Context
// ============================================================================

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// Lucide Icons - Importaciones completas
import { 
    PieChart, DollarSign, Calendar, AlertTriangle, ArrowRight, 
    Menu, X, BrainCircuit, Wallet, Target, BarChart3, ShieldCheck, 
    List, ChevronRight, Info, Printer, Sparkles, Bot, Settings, 
    FileText, TrendingDown, TrendingUp, Share2, Copy, Calculator, PiggyBank,
    Coffee, Home, Car, ShoppingBag, Zap, ExternalLink, User, Building2, CreditCard,
    RotateCcw, CheckCircle2, Code2, Coins, TrendingUp as TrendingUpIcon, FileSearch, Receipt,
    Download, Layers, Percent, AlertCircle, Briefcase, Stamp, Scale, SlidersHorizontal, Check
} from 'lucide-react';

// Recharts - Componentes de gráficos
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area, Cell, Pie, PieChart as RechartsPieChart, 
    LineChart, Line, Legend
} from 'recharts';

// ============================================================================
// SISTEMA DE NOTIFICACIONES (TOAST)
// ============================================================================

const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 toast-container no-print pointer-events-none">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className="pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium animate-in slide-in-from-bottom-4"
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle2 size={18} className="text-emerald-400" />
                        ) : toast.type === 'error' ? (
                            <AlertTriangle size={18} className="text-red-400" />
                        ) : (
                            <Info size={18} className="text-blue-400" />
                        )}
                        {message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe usarse dentro de ToastProvider');
    }
    return context;
};

// ============================================================================
// EXPORTACIONES GLOBALES
// ============================================================================

export {
    React, useState, useEffect, useMemo, useRef, useCallback,
    createRoot,
    // Icons
    PieChart, DollarSign, Calendar, AlertTriangle, ArrowRight, 
    Menu, X, BrainCircuit, Wallet, Target, BarChart3, ShieldCheck, 
    List, ChevronRight, Info, Printer, Sparkles, Bot, Settings, 
    FileText, TrendingDown, TrendingUp, Share2, Copy, Calculator, PiggyBank,
    Coffee, Home, Car, ShoppingBag, Zap, ExternalLink, User, Building2, CreditCard,
    RotateCcw, CheckCircle2, Code2, Coins, TrendingUpIcon, FileSearch, Receipt,
    Download, Layers, Percent, AlertCircle, Briefcase, Stamp, Scale, SlidersHorizontal, Check,
    // Recharts
    XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area, Cell, Pie, RechartsPieChart, 
    LineChart, Line, Legend
};

// ============================================================================
// CREDIMASTER PRO V4.0 - PARTE 2/7
// Utilidades de Formato y Componentes Base Reutilizables
// ============================================================================

import { React, useState, useEffect } from './imports-and-context.js';

// ============================================================================
// UTILIDADES DE FORMATO
// ============================================================================

/**
 * Formatea un número como moneda colombiana (COP)
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (default: 0)
 * @returns {string} Valor formateado como COP
 */
export const formatCurrency = (value, decimals = 0) => {
    if (value === null || value === undefined || isNaN(value)) return '$0';
    
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};

/**
 * Formatea un número con separadores de miles
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (default: 2)
 * @returns {string} Valor formateado
 */
export const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    }).format(value);
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear (ej: 13.5 para 13.5%)
 * @param {number} decimals - Número de decimales (default: 2)
 * @returns {string} Valor formateado con símbolo %
 */
export const formatPercent = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) return '0%';
    return `${formatNumber(value, decimals)}%`;
};

/**
 * Hook para debouncing de valores
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay en milisegundos
 * @returns {any} Valor con debounce aplicado
 */
export function useDebounce(value, delay) {
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

/**
 * Convierte un string formateado a número
 * @param {string} str - String con formato (ej: "1.500.000,50")
 * @returns {number} Número parseado
 */
export const parseFormattedNumber = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    
    // Eliminar puntos de miles y reemplazar coma decimal por punto
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? 0 : parsed;
};

// ============================================================================
// COMPONENTE: NUMERIC INPUT
// ============================================================================

export const NumericInput = ({ 
    label, 
    value, 
    onChange, 
    type = 'currency', 
    className = '', 
    icon: Icon, 
    placeholder = "0", 
    highlight = false,
    decimals = 2,
    readOnly = false,
    negative = false,
    subLabel = null,
    min = null,
    max = null
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Actualizar el valor mostrado cuando cambia el valor externo
    useEffect(() => {
        if (isFocused) return; // No actualizar mientras el usuario está editando
        
        if (value === '' || value === null || value === undefined) {
            setInputValue('');
        } else {
            const opts = { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: decimals 
            };
            setInputValue(new Intl.NumberFormat('es-CO', opts).format(value));
        }
    }, [value, decimals, isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
        if (!readOnly && value !== 0 && value) {
            // Mostrar el número puro al editar
            setInputValue(value.toString().replace('.', ','));
        } else if (!readOnly) {
            setInputValue('');
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (value !== '' && value !== null && value !== undefined) {
            const opts = { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: decimals 
            };
            setInputValue(new Intl.NumberFormat('es-CO', opts).format(value));
        }
    };

    const handleChange = (e) => {
        if (readOnly) return;
        
        let raw = e.target.value;
        
        // Permitir solo números, puntos y comas
        if (!/^[0-9.,]*$/.test(raw)) return;
        
        setInputValue(raw);
        
        // Convertir a número
        let numStr = raw.replace(/\./g, '').replace(',', '.');
        
        if (numStr === '' || numStr === '.') {
            onChange(0);
            return;
        }
        
        const parsed = parseFloat(numStr);
        
        if (!isNaN(parsed)) {
            // Aplicar límites si existen
            let finalValue = parsed;
            if (min !== null && finalValue < min) finalValue = min;
            if (max !== null && finalValue > max) finalValue = max;
            
            onChange(finalValue);
        }
    };

    const colorClasses = negative 
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-500 focus:ring-emerald-200' 
        : (highlight 
            ? 'bg-indigo-50 border-indigo-200 text-indigo-900 focus:border-indigo-500 focus:ring-indigo-200' 
            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-blue-200 focus:bg-white');

    return (
        <div className={`space-y-2 ${className} ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-end">
                <label className={`text-xs font-bold uppercase tracking-wide flex flex-wrap gap-1 items-center ${
                    highlight ? 'text-indigo-600' : (negative ? 'text-emerald-600' : 'text-slate-500')
                }`}>
                    <span className="flex items-center gap-1.5">
                        {Icon && <Icon size={14} className={
                            highlight ? 'text-indigo-500' : (negative ? 'text-emerald-500' : 'text-slate-400')
                        } />}
                        {label}
                    </span>
                </label>
                {(type === 'percent' || type === 'points') && (
                    <span className="text-[10px] text-slate-400 font-normal">% E.A. / Puntos</span>
                )}
                {type === 'uvr' && (
                    <span className="text-[10px] text-slate-400 font-normal">Unidad</span>
                )}
            </div>
            
            <div className="relative group">
                {type === 'currency' && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className={`font-semibold transition-colors ${
                            negative ? 'text-emerald-500' : (highlight ? 'text-indigo-500' : 'text-slate-400')
                        }`}>
                            {negative ? '-' : ''}$
                        </span>
                    </div>
                )}
                
                <input
                    type="text"
                    inputMode="decimal"
                    value={inputValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    readOnly={readOnly}
                    className={`block w-full rounded-xl p-3 text-sm font-bold focus:ring-2 shadow-sm transition-all outline-none border 
                        ${type === 'currency' ? 'pl-7' : ''} 
                        ${colorClasses}
                        ${readOnly ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : ''}`}
                    placeholder={placeholder}
                />
                
                {(type === 'percent' || type === 'points') && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-semibold">%</span>
                    </div>
                )}
            </div>
            
            {subLabel && (
                <p className="text-[10px] text-slate-400 leading-tight">{subLabel}</p>
            )}
        </div>
    );
};

// ============================================================================
// COMPONENTE: TOGGLE SWITCH
// ============================================================================

export const ToggleSwitch = ({ 
    label, 
    checked, 
    onChange, 
    activeColor = 'bg-emerald-500',
    disabled = false 
}) => (
    <div 
        className={`flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'
        }`}
        onClick={() => !disabled && onChange(!checked)}
    >
        <div className="text-sm font-medium text-slate-700 leading-tight select-none pr-2">
            {label}
        </div>
        <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
            checked ? activeColor : 'bg-slate-300'
        }`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`} />
        </div>
    </div>
);

// ============================================================================
// COMPONENTE: CREDIT CARD ICON
// ============================================================================

export const CreditCardIcon = ({ size = 24, className = '' }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
);

// ============================================================================
// CREDIMASTER PRO V4.0 - PARTE 3/7
// Componente de Formulario de Parámetros del Crédito
// ============================================================================

import { React } from './imports-and-context.js';
import { 
    Settings, FileSearch, CheckCircle2, SlidersHorizontal 
} from './imports-and-context.js';
import { NumericInput, ToggleSwitch } from './utilities-and-components.js';

// ============================================================================
// FORMULARIO DE PARÁMETROS DEL CRÉDITO
// ============================================================================

export const CreditParametersForm = ({ inputs, handleInputChange, setInputs, className = "" }) => {
    
    // Sincronización UVR/Pesos - Manejo preciso de conversiones
    const handleUVRUnitBalanceChange = (newUVRBalance) => {
        setInputs(prev => ({
            ...prev,
            loanAmountUVR: newUVRBalance,
            loanAmount: Math.round(newUVRBalance * prev.uvrValue * 100) / 100
        }));
    };

    const handleUVRValueChange = (newUVRValue) => {
        setInputs(prev => ({
            ...prev,
            uvrValue: newUVRValue,
            loanAmount: Math.round(prev.loanAmountUVR * newUVRValue * 100) / 100
        }));
    };

    const handlePesoBalanceChange = (newPesoBalance) => {
        setInputs(prev => ({
            ...prev,
            loanAmount: newPesoBalance,
            loanAmountUVR: prev.isUVR && prev.uvrValue > 0 
                ? Math.round((newPesoBalance / prev.uvrValue) * 10000) / 10000
                : 0
        }));
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="space-y-4">
                {/* Header de sección */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                        <Settings size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                        Datos del Crédito
                    </h3>
                </div>

                {/* Selector Tipo de Crédito: PESOS vs UVR */}
                <div className="bg-slate-100 p-1 rounded-xl flex mb-4">
                    <button 
                        onClick={() => handleInputChange('isUVR', false)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            !inputs.isUVR 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        PESOS (Tasa Fija)
                    </button>
                    <button 
                        onClick={() => handleInputChange('isUVR', true)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            inputs.isUVR 
                                ? 'bg-white text-purple-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        UVR (Indexado)
                    </button>
                </div>

                {/* Panel UVR - Solo visible si es crédito UVR */}
                {inputs.isUVR && (
                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl space-y-3 animate-in fade-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <FileSearch size={100}/>
                        </div>
                        
                        <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase mb-1 relative z-10">
                            <FileSearch size={14} /> Variables UVR (Precisión)
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                            <NumericInput 
                                label="Saldo Capital (UVR)" 
                                type="uvr"
                                value={inputs.loanAmountUVR} 
                                onChange={handleUVRUnitBalanceChange}
                                decimals={4}
                                highlight={true}
                                placeholder="Ej: 45032.1234"
                                min={0}
                            />
                            <NumericInput 
                                label="Valor UVR (Día Corte)" 
                                type="uvr"
                                value={inputs.uvrValue} 
                                onChange={handleUVRValueChange}
                                decimals={4}
                                placeholder="Ej: 360.5432"
                                min={0}
                            />
                        </div>
                        
                        <div className="relative z-10 grid grid-cols-1 gap-3">
                            <NumericInput 
                                label="Inflación Estimada (Anual)" 
                                type="percent"
                                value={inputs.inflation} 
                                onChange={(v) => handleInputChange('inflation', v)}
                                decimals={2}
                                placeholder="Ej: 4.5"
                                min={0}
                                max={100}
                            />
                        </div>
                    </div>
                )}
                
                {/* Saldo de Deuda en Pesos */}
                <NumericInput 
                    label={inputs.isUVR ? "Saldo Capital (Pesos Calculado)" : "Saldo Deuda Actual (Pesos)"}
                    value={inputs.loanAmount} 
                    onChange={handlePesoBalanceChange}
                    readOnly={inputs.isUVR} 
                    highlight={!inputs.isUVR}
                    placeholder="Ej: 180000000"
                    min={0}
                />

                {/* SECCIÓN DE CALIBRACIÓN MEJORADA */}
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 relative">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <SlidersHorizontal size={14} className="text-indigo-600"/>
                            <span className="text-xs font-bold text-indigo-900 uppercase">
                                Calibración Extracto
                            </span>
                        </div>
                        <div className="bg-indigo-100 text-indigo-700 text-[9px] px-2 py-0.5 rounded-full font-bold">
                            Recomendado
                        </div>
                    </div>
                    
                    <p className="text-[10px] text-indigo-500/80 mb-3 leading-tight">
                        Ingresa los valores exactos de tu última factura para ajustar la precisión del cálculo.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <NumericInput 
                            label="Abono Capital Actual" 
                            value={inputs.calibrationCapital} 
                            onChange={(v) => handleInputChange('calibrationCapital', v)} 
                            highlight={false}
                            placeholder="Ej: 450.000"
                            min={0}
                        />
                        <NumericInput 
                            label="Intereses Corrientes" 
                            value={inputs.calibrationInterest} 
                            onChange={(v) => handleInputChange('calibrationInterest', v)} 
                            highlight={false}
                            placeholder="Ej: 1.200.000"
                            min={0}
                        />
                    </div>
                    
                    <NumericInput 
                        label="Valor Cuota (Total Extracto)" 
                        value={inputs.currentQuota} 
                        onChange={(v) => handleInputChange('currentQuota', v)} 
                        highlight={true}
                        icon={CheckCircle2}
                        placeholder="Ej: 2.500.000"
                        min={0}
                    />
                </div>

                {/* Tasa y Plazo */}
                <div className="grid grid-cols-2 gap-3">
                    <NumericInput 
                        label={inputs.isUVR ? "Tasa E.A. (Full)" : "Tasa E.A."} 
                        type="percent"
                        value={inputs.rateEA} 
                        onChange={(v) => handleInputChange('rateEA', v)} 
                        placeholder="Ej: 13.5"
                        min={0}
                        max={100}
                    />
                    <NumericInput 
                        label="Plazo Restante (Meses)" 
                        type="number" 
                        value={inputs.months} 
                        onChange={(v) => handleInputChange('months', v)}
                        decimals={0} 
                        placeholder="Ej: 240"
                        min={1}
                        max={600}
                    />
                </div>

                {/* SECCIÓN FRECH/ECOBERTURA MEJORADA */}
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-3">
                    <ToggleSwitch 
                        label={
                            <span className="text-xs font-bold text-emerald-800">
                                ¿Tiene Subsidio FRECH / Ecobertura?
                            </span>
                        }
                        checked={inputs.hasFrech}
                        onChange={(v) => handleInputChange('hasFrech', v)}
                    />
                    
                    {inputs.hasFrech && (
                        <div className="animate-in fade-in space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <NumericInput 
                                    label="Puntos Subsidio"
                                    type="points"
                                    value={inputs.frechPoints} 
                                    onChange={(v) => handleInputChange('frechPoints', v)}
                                    decimals={2}
                                    negative={true}
                                    placeholder="Ej: 4.0"
                                    min={0}
                                    max={10}
                                />
                                <NumericInput 
                                    label="Cuotas Restantes Cobertura" 
                                    type="number"
                                    value={inputs.frechRemainingMonths} 
                                    onChange={(v) => handleInputChange('frechRemainingMonths', v)}
                                    decimals={0}
                                    placeholder="Ej: 60"
                                    min={0}
                                />
                            </div>
                            <NumericInput 
                                label="Valor Beneficio (Extracto)" 
                                value={inputs.frechMonthlyValue} 
                                onChange={(v) => handleInputChange('frechMonthlyValue', v)}
                                decimals={0}
                                negative={true}
                                placeholder="Ej: 350.000"
                                subLabel="Ingresa el valor del subsidio que aparece en tu factura para mayor precisión."
                                min={0}
                            />
                        </div>
                    )}
                </div>

                {/* Seguros y otros */}
                <div className="space-y-3 p-3 border border-slate-100 rounded-xl bg-slate-50">
                    <NumericInput 
                        label="Seguros / Otros (Mensual Actual)" 
                        value={inputs.insurance} 
                        onChange={(v) => handleInputChange('insurance', v)} 
                        placeholder="Ej: 65000"
                        min={0}
                    />
                    <ToggleSwitch 
                        label={
                            <span className="text-xs font-semibold text-slate-600 block">
                                Proyectar Aumento Seguros (IPC) 
                                <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                                    El seguro subirá cada año con la inflación
                                </span>
                            </span>
                        }
                        checked={inputs.insuranceIndexed}
                        onChange={(v) => handleInputChange('insuranceIndexed', v)}
                        activeColor="bg-slate-800"
                    />
                </div>
            </div>

            {/* SECCIÓN DE ESTRATEGIA */}
            <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-100 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Settings size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">
                        Tu Estrategia
                    </h3>
                </div>
                
                <NumericInput 
                    label="Abono Extra Mensual (Pesos)" 
                    value={inputs.extraMonthly} 
                    onChange={(v) => handleInputChange('extraMonthly', v)} 
                    className="[&_input]:bg-white [&_input]:border-emerald-200 [&_input]:text-emerald-800 [&_input]:focus:ring-emerald-200 [&_input]:focus:border-emerald-500"
                    placeholder="Ej: 400000"
                    min={0}
                />
                
                {/* INCREMENTO ANUAL - Efecto Bola de Nieve */}
                <NumericInput 
                    label="Incrementar Abono Anualmente" 
                    type="percent"
                    value={inputs.annualIncrease} 
                    onChange={(v) => handleInputChange('annualIncrease', v)} 
                    subLabel="Aumenta tu abono cada año (Efecto Bola de Nieve)"
                    className="[&_input]:bg-white"
                    placeholder="Ej: 5"
                    min={0}
                    max={100}
                />

                <ToggleSwitch 
                    label={
                        <span className="text-xs font-semibold text-slate-600 block">
                            Usar Primas (Jun/Dic) 
                            <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                                Duplica el abono extra estos meses
                            </span>
                        </span>
                    }
                    checked={inputs.usePrimas}
                    onChange={(v) => handleInputChange('usePrimas', v)}
                />
                
                <NumericInput 
                    label="Abono Único Inicial (Pesos)" 
                    value={inputs.oneTimePayment} 
                    onChange={(v) => handleInputChange('oneTimePayment', v)} 
                    placeholder="Ej: 5000000"
                    min={0}
                />
            </div>
        </div>
    );
};

// ============================================================================
// CREDIMASTER PRO V4.0 - PARTE 4/7
// Motor de Cálculo Financiero Avanzado
// Precisión de nivel Excel/Google Sheets
// ============================================================================

/**
 * Motor de cálculo financiero para créditos hipotecarios
 * Soporta: Pesos, UVR, FRECH, seguros indexados, y abonos extraordinarios
 * 
 * @param {Object} params - Parámetros del crédito
 * @returns {Object|null} - Resultados con métricas, gráficos y tabla de amortización
 */
export const calculateEngine = (params) => {
    const { 
        loanAmount,           // Saldo en pesos
        loanAmountUVR,        // Saldo en unidades UVR
        rateEA,               // Tasa Efectiva Anual (%)
        months,               // Plazo restante en meses
        insurance,            // Seguros mensuales
        extraMonthly,         // Abono extra mensual
        usePrimas,            // Usar primas (duplicar en Jun/Dic)
        oneTimePayment,       // Abono único inicial
        currentQuota,         // Cuota actual del extracto
        isUVR,                // ¿Es crédito UVR?
        uvrValue,             // Valor UVR actual
        inflation,            // Inflación anual estimada (%)
        hasFrech,             // ¿Tiene subsidio FRECH?
        frechPoints,          // Puntos de subsidio FRECH
        frechRemainingMonths, // Meses restantes de FRECH
        frechMonthlyValue,    // Valor mensual del subsidio FRECH
        calibrationCapital,   // Capital del extracto (calibración)
        calibrationInterest,  // Intereses del extracto (calibración)
        annualIncrease = 0,   // Incremento anual del abono (%)
        insuranceIndexed = true // ¿Indexar seguros por inflación?
    } = params;
    
    // ========================================================================
    // VALIDACIONES INICIALES
    // ========================================================================
    
    if (!loanAmount || loanAmount <= 0) return null;
    if (!rateEA || rateEA <= 0) return null;
    if (isUVR && (!uvrValue || uvrValue <= 0)) return null;
    
    // ========================================================================
    // 1. CÁLCULO DE TASAS
    // ========================================================================
    
    // Tasa mensual estándar (conversión de EA a mensual)
    const standardMonthlyRate = Math.pow(1 + rateEA / 100, 1 / 12) - 1;
    
    // Tasa mensual efectiva (puede ser calibrada o estándar)
    let rateMonthlyFull;
    let impliedMonthlyRate = 0;
    
    // Si hay calibración con intereses del extracto, usamos la tasa implícita
    if (calibrationInterest > 0 && loanAmount > 0) {
        impliedMonthlyRate = calibrationInterest / loanAmount;
        rateMonthlyFull = impliedMonthlyRate;
    } else {
        rateMonthlyFull = standardMonthlyRate;
    }
    
    // Tasa de inflación mensual (para UVR y seguros indexados)
    const inflationMonthly = (isUVR || insuranceIndexed) 
        ? (Math.pow(1 + inflation / 100, 1 / 12) - 1) 
        : 0;
    
    // ========================================================================
    // 2. INICIALIZACIÓN DE SALDOS
    // ========================================================================
    
    // Balance base en unidades (UVR o pesos según el tipo)
    let balanceBaseUVR;
    
    if (isUVR) {
        balanceBaseUVR = (loanAmountUVR > 0) 
            ? loanAmountUVR 
            : loanAmount / uvrValue;
    } else {
        balanceBaseUVR = loanAmount;
    }
    
    // Balance para simulación con estrategia
    let balanceStrategyUnit = balanceBaseUVR;
    
    // Valor UVR actual (1 si es en pesos)
    let currentUVR = isUVR ? uvrValue : 1;
    
    // ========================================================================
    // 3. CÁLCULO DE CUOTA BASE (PMT)
    // ========================================================================
    
    let pmtFixedUnit;              // Cuota base en unidades (sin seguros)
    let pmtTotalObligatoryDisplay; // Cuota total obligatoria (con seguros)
    let isManualQuota = false;     // ¿Se usó calibración manual?
    
    // Método 1: Calibración con Capital + Intereses del extracto
    if (calibrationCapital > 0 && calibrationInterest > 0) {
        const totalBasePesos = calibrationCapital + calibrationInterest;
        
        pmtFixedUnit = isUVR 
            ? (totalBasePesos / uvrValue) 
            : totalBasePesos;
        
        pmtTotalObligatoryDisplay = totalBasePesos + insurance;
        isManualQuota = true;
    } 
    // Método 2: Cuota total del extracto (menos seguros)
    else if (currentQuota && currentQuota > insurance) {
        const quotaWithoutInsurance = currentQuota - insurance;
        
        pmtFixedUnit = isUVR 
            ? (quotaWithoutInsurance / uvrValue) 
            : quotaWithoutInsurance;
        
        pmtTotalObligatoryDisplay = currentQuota;
        isManualQuota = true;
    } 
    // Método 3: Cálculo estándar PMT
    else {
        if (!months || months <= 0) return null;
        
        // Fórmula PMT: P * (r * (1+r)^n) / ((1+r)^n - 1)
        const r = rateMonthlyFull;
        const n = months;
        const factor = Math.pow(1 + r, n);
        
        pmtFixedUnit = balanceBaseUVR * (r * factor) / (factor - 1);
        
        // Proyección del primer pago en pesos
        const firstMonthPaymentPesos = isUVR 
            ? (pmtFixedUnit * (uvrValue * (1 + inflationMonthly))) + insurance 
            : pmtFixedUnit + insurance;
        
        pmtTotalObligatoryDisplay = firstMonthPaymentPesos;
    }
    
    // ========================================================================
    // 4. LÓGICA FRECH (SUBSIDIO)
    // ========================================================================
    
    let frechRateReductionFactor = 0;
    
    if (hasFrech) {
        // Método 1: Calibrar con el valor exacto del extracto
        if (frechMonthlyValue > 0 && loanAmount > 0) {
            frechRateReductionFactor = frechMonthlyValue / loanAmount;
        } 
        // Método 2: Calcular por diferencia de tasas
        else if (frechPoints > 0) {
            const rateWithFrech = Math.max(0, rateEA - frechPoints);
            const monthlyWith = Math.pow(1 + rateWithFrech / 100, 1 / 12) - 1;
            frechRateReductionFactor = rateMonthlyFull - monthlyWith;
        }
    }
    
    // Límite de meses con subsidio
    const frechLimitMonth = (frechRemainingMonths > 0) 
        ? frechRemainingMonths 
        : 84; // Default 7 años
    
    // ========================================================================
    // 5. SIMULACIÓN DE ESTRATEGIA
    // ========================================================================
    
    const schedule = [];              // Tabla de amortización
    let totalInterestPaidPesos = 0;   // Total intereses pagados
    let totalFrechBenefitPesos = 0;   // Total beneficio FRECH
    let currentMonth = 0;
    const SAFE_LIMIT = 600;           // Límite de seguridad (50 años)
    
    // Variables de estado
    let tempBalanceUnit = balanceStrategyUnit;
    let tempUVR = currentUVR;
    let currentInsurance = insurance;
    let currentExtraMonthly = extraMonthly;
    
    // Datos para gráfico
    const graphData = [{
        mes: 0,
        deudaBanco: Math.round(isUVR ? balanceBaseUVR * uvrValue : loanAmount),
        deudaEstrategia: Math.round(isUVR ? balanceStrategyUnit * uvrValue : loanAmount),
    }];
    
    // Simulación paralela del banco (sin abonos extra)
    let balanceBancoUnit = balanceBaseUVR;
    let uvrBanco = currentUVR;
    let insuranceBanco = insurance;
    const scheduleBanco = [];
    let totalInterestBancoPesos = 0;
    let totalInsuranceBanco = 0;
    
    // ========================================================================
    // LOOP DE SIMULACIÓN MES A MES
    // ========================================================================
    
    while (tempBalanceUnit > (isUVR ? 0.01 : 100) && currentMonth < SAFE_LIMIT) {
        currentMonth++;
        
        // --- ACTUALIZACIÓN DE VARIABLES INDEXADAS ---
        
        // UVR: se ajusta mensualmente por inflación
        if (isUVR) {
            tempUVR = tempUVR * (1 + inflationMonthly);
            uvrBanco = uvrBanco * (1 + inflationMonthly);
        }
        
        // Seguros: se ajustan mensualmente si está activado
        if (insuranceIndexed) {
            currentInsurance = currentInsurance * (1 + inflationMonthly);
            insuranceBanco = insuranceBanco * (1 + inflationMonthly);
        }
        
        // Incremento anual del abono (efecto bola de nieve)
        // Se aplica cada 12 meses (excepto el mes 1)
        if (currentMonth > 1 && currentMonth % 12 === 1 && annualIncrease > 0) {
            currentExtraMonthly = currentExtraMonthly * (1 + (annualIncrease / 100));
        }
        
        // --- CÁLCULO DE INTERESES ---
        
        const interestFullUnit = tempBalanceUnit * rateMonthlyFull;
        
        // Subsidio FRECH (si aplica)
        let frechSubsidyUnit = 0;
        if (hasFrech && currentMonth <= frechLimitMonth) {
            frechSubsidyUnit = tempBalanceUnit * frechRateReductionFactor;
            // No puede ser mayor al interés total
            if (frechSubsidyUnit > interestFullUnit) {
                frechSubsidyUnit = interestFullUnit;
            }
        }
        
        // Interés neto (lo que paga el cliente)
        const interestClientUnit = interestFullUnit - frechSubsidyUnit;
        
        // --- CÁLCULO DE ABONO A CAPITAL ---
        
        // Capital ordinario (parte de la cuota fija)
        let capitalOrdinaryUnit = pmtFixedUnit - interestFullUnit;
        
        // Protección: no puede ser negativo
        if (capitalOrdinaryUnit < 0) capitalOrdinaryUnit = 0;
        
        // Abono extraordinario
        let paymentExtraPesos = currentExtraMonthly;
        
        // Duplicar en primas (junio y diciembre)
        if (usePrimas && (currentMonth % 12 === 6 || currentMonth % 12 === 0)) {
            paymentExtraPesos += currentExtraMonthly;
        }
        
        // Abono único inicial (solo en el mes 1)
        if (currentMonth === 1) {
            paymentExtraPesos += oneTimePayment;
        }
        
        // Convertir abono extra a unidades
        let paymentExtraUnit = isUVR 
            ? (paymentExtraPesos / tempUVR) 
            : paymentExtraPesos;
        
        // Total abono a capital
        let capitalTotalUnit = capitalOrdinaryUnit + paymentExtraUnit;
        
        // Protección: no se puede abonar más que el saldo
        if (capitalTotalUnit > tempBalanceUnit) {
            capitalTotalUnit = tempBalanceUnit;
            
            if (tempBalanceUnit < capitalOrdinaryUnit) {
                capitalOrdinaryUnit = tempBalanceUnit;
                paymentExtraUnit = 0;
            } else {
                paymentExtraUnit = tempBalanceUnit - capitalOrdinaryUnit;
            }
        }
        
        // --- ACTUALIZACIÓN DE SALDO ---
        
        tempBalanceUnit -= capitalTotalUnit;
        
        // Protección de precisión
        if (tempBalanceUnit < (isUVR ? 0.0001 : 1)) {
            tempBalanceUnit = 0;
        }
        
        // --- SIMULACIÓN PARALELA DEL BANCO ---
        
        if (balanceBancoUnit > (isUVR ? 0.01 : 100)) {
            const intBancoFullUnit = balanceBancoUnit * rateMonthlyFull;
            
            let frechBancoUnit = 0;
            if (hasFrech && currentMonth <= frechLimitMonth) {
                frechBancoUnit = balanceBancoUnit * frechRateReductionFactor;
                if (frechBancoUnit > intBancoFullUnit) {
                    frechBancoUnit = intBancoFullUnit;
                }
            }
            
            const intBancoNetUnit = intBancoFullUnit - frechBancoUnit;
            let capBancoUnit = pmtFixedUnit - intBancoFullUnit;
            
            if (capBancoUnit > balanceBancoUnit) {
                capBancoUnit = balanceBancoUnit;
            }
            
            balanceBancoUnit -= capBancoUnit;
            
            if (balanceBancoUnit < (isUVR ? 0.0001 : 1)) {
                balanceBancoUnit = 0;
            }
            
            totalInterestBancoPesos += (isUVR ? intBancoNetUnit * uvrBanco : intBancoNetUnit);
            totalInsuranceBanco += insuranceBanco;
        }
        
        scheduleBanco.push(isUVR ? balanceBancoUnit * uvrBanco : balanceBancoUnit);
        
        // --- CONVERSIÓN A PESOS PARA REGISTRO ---
        
        const interestFullPesos = isUVR ? interestFullUnit * tempUVR : interestFullUnit;
        const frechSubsidyPesos = isUVR ? frechSubsidyUnit * tempUVR : frechSubsidyUnit;
        const interestClientPesos = isUVR ? interestClientUnit * tempUVR : interestClientUnit;
        const capitalOrdinaryPesos = isUVR ? capitalOrdinaryUnit * tempUVR : capitalOrdinaryUnit;
        const capitalTotalPesos = isUVR ? capitalTotalUnit * tempUVR : capitalTotalUnit;
        const paymentExtraAppliedPesos = isUVR ? paymentExtraUnit * tempUVR : paymentExtraUnit;
        const balancePesos = isUVR ? tempBalanceUnit * tempUVR : tempBalanceUnit;
        
        // Cuota total de bolsillo (lo que realmente paga el cliente)
        const totalPaymentPocketPesos = interestClientPesos + capitalOrdinaryPesos + currentInsurance + paymentExtraAppliedPesos;
        
        // Acumuladores
        totalInterestPaidPesos += interestClientPesos;
        totalFrechBenefitPesos += frechSubsidyPesos;
        
        // --- REGISTRO EN TABLA DE AMORTIZACIÓN ---
        
        schedule.push({
            month: currentMonth,
            paymentTotal: totalPaymentPocketPesos,
            capitalOrdinary: capitalOrdinaryPesos,
            capitalTotal: capitalTotalPesos,
            interestFull: interestFullPesos,
            frechBenefit: frechSubsidyPesos,
            interestNet: interestClientPesos,
            insurance: currentInsurance,
            balance: balancePesos > 1 ? balancePesos : 0,
            extraApplied: paymentExtraAppliedPesos,
            uvrUnitValue: isUVR ? tempUVR : null
        });
        
        // --- DATOS PARA GRÁFICO (cada 3 meses) ---
        
        if (currentMonth % 3 === 0 || tempBalanceUnit <= 0 || currentMonth === 1) {
            graphData.push({
                mes: currentMonth,
                deudaBanco: Math.round(scheduleBanco[currentMonth - 1] || 0),
                deudaEstrategia: Math.round(balancePesos > 0 ? balancePesos : 0),
            });
        }
    }
    
    // Punto final para el gráfico
    if (currentMonth < months) {
        graphData.push({
            mes: months,
            deudaBanco: 0,
            deudaEstrategia: 0
        });
    }
    
    // ========================================================================
    // 6. CÁLCULO DE MÉTRICAS FINALES
    // ========================================================================
    
    const totalInsurancePaid = schedule.reduce((sum, row) => sum + row.insurance, 0);
    const totalCapitalPaid = schedule.reduce((sum, row) => sum + row.capitalTotal, 0);
    
    // Costo total original (banco)
    const totalPaymentOriginalPesos = (isUVR ? balanceBaseUVR * uvrValue : loanAmount) 
        + totalInterestBancoPesos 
        + totalInsuranceBanco;
    
    // Costo total con estrategia
    const totalPaymentNewPesos = (isUVR ? balanceBaseUVR * uvrValue : loanAmount) 
        + totalInterestPaidPesos 
        + totalInsurancePaid;
    
    // Multiplicador de costo (cuántas veces el monto prestado)
    const costMultiplier = totalPaymentNewPesos / (isUVR ? balanceBaseUVR * uvrValue : loanAmount);
    
    // ========================================================================
    // 7. RETORNO DE RESULTADOS
    // ========================================================================
    
    return {
        metrics: {
            originalTerm: months,
            newTerm: schedule.length,
            monthsSaved: Math.max(0, months - schedule.length),
            interestSaved: Math.max(0, totalInterestBancoPesos - totalInterestPaidPesos),
            totalPaymentOriginal: totalPaymentOriginalPesos,
            totalPaymentNew: totalPaymentNewPesos,
            monthlyObligatory: pmtTotalObligatoryDisplay,
            monthlyTotalEffort: schedule[0]?.paymentTotal || 0,
            effortIncreasePct: pmtTotalObligatoryDisplay > 0 
                ? ((schedule[0]?.paymentTotal - pmtTotalObligatoryDisplay) / pmtTotalObligatoryDisplay) * 100 
                : 0,
            timeReductionPct: months > 0 
                ? ((months - schedule.length) / months) * 100 
                : 0,
            isManualQuota,
            isUVR,
            hasFrech,
            totalFrechBenefit: totalFrechBenefitPesos,
            costMultiplier,
            insuranceIndexed,
            totalInsurancePaid,
            totalCapitalPaid
        },
        graphData,
        schedule
    };
};

// ============================================================================
// CREDIMASTER PRO V4.0 - PARTE 5/7
// Vistas: Dashboard y Presupuesto
// ============================================================================

import { React, useState } from './imports-and-context.js';
import { 
    Wallet, Calendar, DollarSign, Target, BarChart3, TrendingDown,
    TrendingUp, Calculator, Coffee, Home, Car, ShoppingBag, Zap,
    ArrowRight, Sparkles
} from './imports-and-context.js';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, RechartsPieChart, Pie, Cell
} from './imports-and-context.js';
import { formatCurrency, NumericInput } from './utilities-and-components.js';

// ============================================================================
// VISTA: DASHBOARD
// ============================================================================

export const DashboardView = ({ metrics, graphData }) => {
    
    // Tooltip personalizado para el gráfico
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 shadow-xl rounded-xl text-xs z-50">
                    <p className="font-bold text-slate-700 mb-2">Mes {label}</p>
                    <div className="space-y-1">
                        <p className="text-slate-500">
                            Banco: <span className="font-mono font-medium text-slate-700">
                                {formatCurrency(payload[0].value)}
                            </span>
                        </p>
                        <p className="text-emerald-600">
                            Estrategia: <span className="font-mono font-bold">
                                {formatCurrency(payload[1].value)}
                            </span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-20 lg:pb-0 animate-in fade-in duration-500">
            {/* Tarjetas de métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Tarjeta: Ahorro en Intereses */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet size={80} className="text-emerald-600"/>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                            Ahorro Intereses
                        </p>
                        <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-600 tracking-tight break-words">
                            {formatCurrency(metrics.interestSaved)}
                        </h3>
                    </div>
                    <div className="mt-auto pt-4 flex items-center w-full">
                        <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 flex items-center w-full">
                            <TrendingDown size={14} className="mr-1.5 shrink-0" /> 
                            <span className="truncate">Dinero ahorrado</span>
                        </div>
                    </div>
                </div>

                {/* Tarjeta: Tiempo Ganado */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar size={80} className="text-blue-600"/>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                            Tiempo Ganado
                        </p>
                        <h3 className="text-2xl lg:text-3xl font-extrabold text-blue-600 tracking-tight flex flex-wrap gap-x-2 items-baseline">
                            <span>
                                {Math.floor(metrics.monthsSaved / 12)} 
                                <span className="text-lg text-slate-400 font-semibold"> años</span>
                            </span>
                            <span>
                                {metrics.monthsSaved % 12} 
                                <span className="text-lg text-slate-400 font-semibold"> meses</span>
                            </span>
                        </h3>
                    </div>
                    <div className="mt-auto pt-4 flex items-center w-full">
                        <div className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center w-full">
                            <Target size={14} className="mr-1.5 shrink-0" /> 
                            <span className="truncate">-{metrics.timeReductionPct.toFixed(0)}% del plazo total</span>
                        </div>
                    </div>
                </div>

                {/* Tarjeta: Costo Total Crédito */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px]">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                            Costo Total Crédito
                        </p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-2xl font-extrabold text-slate-800 break-words">
                                {metrics.costMultiplier.toFixed(2)}x
                            </h3>
                            <span className="text-xs text-slate-400 font-medium">veces lo prestado</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                            Total: {formatCurrency(metrics.totalPaymentNew)}
                        </p>
                    </div>
                    <div className="mt-auto pt-4 flex items-center w-full">
                        <div className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center w-full">
                            <DollarSign size={14} className="mr-1.5 shrink-0" /> 
                            <span className="truncate">Antes: {formatCurrency(metrics.totalPaymentOriginal)}</span>
                        </div>
                    </div>
                </div>

                {/* Tarjeta: Impacto Estrategia */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden min-h-[160px]">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                    <div>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">
                            Impacto Estrategia
                        </p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-extrabold text-white">Excelente</h3>
                            <span className="text-sm text-yellow-300 font-medium">★★★★★</span>
                        </div>
                    </div>
                    <div className="mt-auto pt-4 text-xs text-indigo-50 leading-relaxed font-medium border-t border-white/10">
                        {metrics.isUVR 
                            ? "En UVR, abonar capital es vital. Tu abono amortigua la inflación y evita que la deuda crezca exponencialmente."
                            : `Estás ahorrando ${formatCurrency(metrics.interestSaved)}. Eso equivale a ${(metrics.interestSaved / 1300000).toFixed(1)} salarios mínimos actuales.`
                        }
                    </div>
                </div>
            </div>

            {/* Panel de comparación de cuotas */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                
                <div className="flex-1 w-full relative z-10">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-slate-300 mr-2"></span>
                        Pago Inicial Estimado
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl lg:text-3xl font-bold text-slate-700">
                            {formatCurrency(metrics.monthlyObligatory)}
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">/mes</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 pl-4">
                        {metrics.hasFrech 
                            ? "Incluye beneficio FRECH" 
                            : (metrics.isUVR ? "Varía cada mes" : "Cuota base + Seguros")
                        }
                    </p>
                </div>
                
                <div className="hidden sm:flex text-slate-300">
                    <ArrowRight size={24} />
                </div>
                
                <div className="flex-1 w-full relative z-10">
                    <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                        Tu Nueva Cuota Potente
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl lg:text-3xl font-bold text-emerald-600">
                            {formatCurrency(metrics.monthlyTotalEffort)}
                        </h3>
                        <span className="text-xs text-emerald-600/60 font-medium">/mes</span>
                    </div>
                    <p className="text-xs text-emerald-600/70 mt-1 pl-4">Incluye abono inteligente</p>
                </div>
                
                <div className="w-full sm:w-auto bg-slate-50 rounded-xl p-4 border border-slate-100 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-500 text-xs font-bold">Esfuerzo Adicional</span>
                        <TrendingUp size={16} className="text-amber-500" />
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                        <span className="text-2xl font-black text-slate-800">
                            +{metrics.effortIncreasePct.toFixed(1)}%
                        </span>
                        <span className="text-xs text-slate-500 font-medium mb-1.5">vs cuota inicial</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(metrics.effortIncreasePct, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Gráfico de proyección */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                    <h3 className="font-bold text-slate-800 flex items-center text-lg">
                        <BarChart3 className="w-5 h-5 mr-2 text-indigo-500"/>
                        Proyección de Libertad (Saldos en Pesos)
                    </h3>
                    <div className="flex gap-4 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-2"></span> Banco
                        </div>
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span> Estrategia
                        </div>
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
                
                {metrics.isUVR && (
                    <p className="text-[10px] text-slate-400 mt-2 text-center italic">
                        * Nota UVR: El gráfico muestra el saldo convertido a pesos. Si la inflación es alta, 
                        el saldo en pesos puede subir aunque abones capital, hasta que tu abono supere el ajuste inflacionario.
                    </p>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// VISTA: PRESUPUESTO (ESTUDIO FINANCIERO)
// ============================================================================

export const BudgetView = ({ onApplyExtra }) => {
    const [finances, setFinances] = useState({
        income: 5000000,
        housing: 1200000,
        food: 800000,
        transport: 400000,
        utilities: 300000,
        entertainment: 300000,
        others: 200000
    });

    const totalExpenses = finances.housing + finances.food + finances.transport 
        + finances.utilities + finances.entertainment + finances.others;
    
    const surplus = finances.income - totalExpenses;
    const recommendedExtra = Math.max(0, Math.floor(surplus * 0.7));

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
                        Analiza tus ingresos y gastos para descubrir cuánto puedes realmente abonar a tu deuda.
                    </p>
                </div>
                <div className="absolute right-0 top-0 opacity-10 p-4">
                    <Calculator size={100} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel de entrada de datos */}
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
                            <NumericInput label="Deudas / Otros" value={finances.others} onChange={(v) => handleChange('others', v)} />
                        </div>
                    </div>
                </div>

                {/* Panel de resultados */}
                <div className="space-y-6">
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
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-xs font-bold text-slate-400">Gastos</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 space-y-3 w-full">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-600 font-medium">Ingresos</span>
                                    <span className="font-bold text-slate-800">{formatCurrency(finances.income)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <span className="text-sm text-emerald-700 font-bold">Disponible Real</span>
                                    <span className="font-bold text-emerald-800 text-lg">{formatCurrency(surplus)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-md border border-indigo-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-indigo-900 mb-2 flex items-center">
                                <Target className="w-5 h-5 mr-2 text-indigo-600"/>
                                Potencial de Aceleración
                            </h3>
                            <div className="flex flex-col gap-3 mt-4">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-xs font-bold text-indigo-400 uppercase">Abono Sugerido</span>
                                    <span className="text-3xl font-black text-indigo-600">
                                        {formatCurrency(recommendedExtra)}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => onApplyExtra(recommendedExtra)} 
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center"
                                >
                                    <Zap className="w-5 h-5 mr-2 fill-current" /> Aplicar esta cantidad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// CREDIMASTER PRO V4.0 - PARTE 6/7
// Vistas: Generador Legal y Tabla Detallada
// ============================================================================

import { React, useState, useRef } from './imports-and-context.js';
import { 
    ShieldCheck, FileSearch, Target, Wallet, Copy, FileText, Printer, Download 
} from './imports-and-context.js';
import { useToast } from './imports-and-context.js';
import { formatCurrency } from './utilities-and-components.js';

// ============================================================================
// VISTA: GENERADOR DE DOCUMENTOS LEGALES
// ============================================================================

export const LegalGenerator = ({ inputs }) => {
    const [type, setType] = useState("plazo");
    const [personalData, setPersonalData] = useState({
        name: "",
        cc: "",
        phone: "",
        bank: "",
        creditNumber: "",
        city: "Bogotá D.C."
    });
    
    const letterRef = useRef(null);
    const { addToast } = useToast();

    const handleCopy = () => {
        if (letterRef.current) {
            const text = letterRef.current.innerText;
            navigator.clipboard.writeText(text)
                .then(() => addToast("¡Carta copiada al portapapeles con éxito!"))
                .catch(() => addToast("Error al copiar", "error"));
        }
    };

    const handleDownloadWord = () => {
        const content = letterRef.current.innerHTML;
        
        const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Carta Derecho de Petición</title>
            <style>
                body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 2.5cm; line-height: 1.5; }
                p { margin-bottom: 12pt; text-align: justify; }
                .header { font-weight: bold; }
                .signature { margin-top: 50pt; border-top: 1pt solid black; width: 200pt; padding-top: 5pt; }
            </style>
        </head>
        <body>`;
        
        const postHtml = "</body></html>";
        const html = preHtml + content + postHtml;

        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `Carta_Abono_${personalData.bank || 'Banco'}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        addToast("Descargando archivo Word...");
    };

    const handlePrint = () => {
        window.print();
    };

    const handleChange = (e) => {
        setPersonalData({ ...personalData, [e.target.name]: e.target.value });
    };

    const currentDate = new Date().toLocaleDateString('es-CO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-0 animate-in fade-in">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 relative overflow-hidden no-print">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={120} className="text-amber-600"/>
                </div>
                <div className="relative z-10">
                    <h2 className="text-lg font-bold text-amber-900 mb-2">Generador de Documentos Jurídicos</h2>
                    <p className="text-amber-800 text-sm mb-4">
                        Esta carta está blindada jurídicamente con la Ley 546 de 1999 para garantizar que tu abono se aplique correctamente.
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="no-print space-y-4 mb-8 border-b border-slate-100 pb-8">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">1. Tus Datos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            name="city" 
                            placeholder="Ciudad (Ej: Bogotá D.C.)" 
                            value={personalData.city} 
                            onChange={handleChange} 
                            className="p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                        <input 
                            type="text" 
                            name="bank" 
                            placeholder="Nombre del Banco" 
                            value={personalData.bank} 
                            onChange={handleChange} 
                            className="p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Nombre del Titular" 
                            value={personalData.name} 
                            onChange={handleChange} 
                            className="p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                        <input 
                            type="text" 
                            name="cc" 
                            placeholder="Cédula de Ciudadanía" 
                            value={personalData.cc} 
                            onChange={handleChange} 
                            className="p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                        <input 
                            type="text" 
                            name="phone" 
                            placeholder="Celular / Contacto" 
                            value={personalData.phone} 
                            onChange={handleChange} 
                            className="p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                        <input 
                            type="text" 
                            name="creditNumber" 
                            placeholder="Número del Crédito" 
                            value={personalData.creditNumber} 
                            onChange={handleChange} 
                            className="p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mt-4">2. ¿Qué quieres lograr?</h3>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setType("plazo")} 
                            className={`flex-1 p-4 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-2 ${
                                type === 'plazo' 
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                            }`}
                        >
                            <Target size={24} />
                            REDUCIR PLAZO (Recomendado)
                            <span className="text-[10px] font-normal opacity-80 text-center">
                                Terminas antes, ahorras más intereses. La cuota sigue igual.
                            </span>
                        </button>
                        <button 
                            onClick={() => setType("cuota")} 
                            className={`flex-1 p-4 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-2 ${
                                type === 'cuota' 
                                    ? 'border-blue-500 bg-blue-50 text-blue-800' 
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                            }`}
                        >
                            <Wallet size={24} />
                            REDUCIR CUOTA
                            <span className="text-[10px] font-normal opacity-80 text-center">
                                Baja el pago mensual. El plazo sigue igual. Libera flujo de caja hoy.
                            </span>
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto bg-slate-50 rounded-xl p-2 md:p-8 md:bg-gray-100 mb-6 border border-slate-200">
                    <div id="printable-area">
                        <div 
                            ref={letterRef} 
                            className="letter-paper font-serif text-slate-900 leading-relaxed max-w-[21.59cm] mx-auto bg-white min-h-[27.94cm] p-[2.5cm] shadow-xl text-justify text-[11pt]"
                        >
                            <p className="mb-8">{personalData.city || "Ciudad"}, {currentDate}</p>
                            
                            <p className="mb-2">Señores</p>
                            <p className="mb-2 font-bold uppercase header">
                                {personalData.bank || "[NOMBRE DEL BANCO]"}
                            </p>
                            <p className="mb-6">Departamento de Cartera / Crédito Hipotecario<br/>E. S. D.</p>
                            
                            <p className="mb-6 text-right font-bold text-sm header">
                                REF: DERECHO DE PETICIÓN - ABONO EXTRAORDINARIO A CAPITAL<br/>
                                Crédito No. {personalData.creditNumber || "___________"}<br/>
                                Titular: {personalData.name || "[NOMBRE DEL TITULAR]"}
                            </p>
                            
                            <p className="mb-4">Respetados señores:</p>
                            
                            <p className="mb-4">
                                Yo, <strong>{personalData.name || "____________________"}</strong>, identificado(a) con la Cédula de Ciudadanía No. <strong>{personalData.cc || "___________"}</strong>, 
                                en mi calidad de deudor del crédito de la referencia, acudo a ustedes para manifestar mi voluntad de realizar un <strong>ABONO EXTRAORDINARIO A CAPITAL</strong> 
                                por valor de <strong>{formatCurrency(inputs.extraMonthly)}</strong> (o la suma que efectivamente consigne).
                            </p>
                            
                            <p className="mb-4">
                                De conformidad con lo establecido en la <strong>Ley 546 de 1999 (Ley de Vivienda), Artículo 17, Numeral 8</strong>, 
                                los deudores de créditos de vivienda tenemos el derecho irrenunciable a prepagar total o parcialmente nuestras obligaciones 
                                <strong> sin penalidad alguna</strong>.
                            </p>

                            <p className="mb-4">
                                En ejercicio de este derecho, solicito expresamente que este dinero se aplique de la siguiente manera:
                            </p>

                            <div className="ml-8 mb-6 p-4 border-l-4 border-black bg-slate-50 italic" style={{ borderLeft: '4px solid black', paddingLeft: '1rem', fontStyle: 'italic', background: '#f8fafc' }}>
                                {type === 'plazo' ? (
                                    <>
                                        <strong>OPCIÓN ELEGIDA: REDUCCIÓN DE PLAZO.</strong><br/>
                                        Solicito que el abono ingrese directamente al capital de la deuda manteniendo el valor de la cuota actual constante, 
                                        con el fin de <strong>disminuir el número de cuotas restantes</strong> (Reducción de Plazo).
                                    </>
                                ) : (
                                    <>
                                        <strong>OPCIÓN ELEGIDA: REDUCCIÓN DEL CANON/CUOTA.</strong><br/>
                                        Solicito que el abono ingrese directamente al capital de la deuda manteniendo el plazo actual constante, 
                                        con el fin de <strong>disminuir el valor mensual de la cuota futura</strong> (Reducción de Cuota).
                                    </>
                                )}
                            </div>

                            <p className="mb-4">
                                Aclaro que este pago <strong>NO debe ser tomado como un adelanto de cuotas futuras</strong>, sino como una amortización extraordinaria 
                                al saldo de capital vigente al momento del pago, tal como lo ordena la Circular Básica Jurídica de la Superintendencia Financiera de Colombia.
                            </p>

                            <p className="mb-12">
                                Quedo a la espera de la confirmación de la aplicación de este pago y el nuevo plan de pagos proyectado.
                                <br/><br/>
                                Atentamente,
                            </p>

                            <br/>
                            <div className="border-t border-black w-64 pt-2 signature">
                                <p className="font-bold">{personalData.name || "Firma"}</p>
                                <p>C.C. {personalData.cc || "___________"}</p>
                                <p>Tel: {personalData.phone || "___________"}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 no-print">
                    <button 
                        onClick={handleCopy} 
                        className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                    >
                        <Copy size={18} /> Copiar Texto
                    </button>
                    <button 
                        onClick={handleDownloadWord} 
                        className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                        <FileText size={18} /> Descargar Word
                    </button>
                    <button 
                        onClick={handlePrint} 
                        className="flex-1 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Printer size={18} /> Imprimir PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// VISTA: TABLA DETALLADA DE AMORTIZACIÓN
// ============================================================================

export const ScheduleView = ({ results, inputs }) => {
    const { addToast } = useToast();

    const downloadCSV = () => {
        if (!results || !results.schedule) return;
        
        const headers = [
            "Mes", "Cuota Total", "Interes Full", "Alivio Frech", "Interes Neto", 
            "Seguros", "Abono Capital Base", "Abono Extra", "Total Abono Capital", "Saldo Pesos"
        ];
        
        const rows = results.schedule.map(row => [
            row.month,
            Math.round(row.paymentTotal),
            Math.round(row.interestFull),
            Math.round(row.frechBenefit),
            Math.round(row.interestNet),
            Math.round(row.insurance),
            Math.round(row.capitalOrdinary),
            Math.round(row.extraApplied),
            Math.round(row.capitalTotal),
            Math.round(row.balance)
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "proyeccion_credito_detallada.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        addToast("Descargando archivo CSV...");
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden pb-20 lg:pb-0 animate-in fade-in">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-700">Tabla Detallada</h3>
                    {inputs.isUVR && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase">
                            UVR Proyectado
                        </span>
                    )}
                </div>
                <button 
                    onClick={downloadCSV} 
                    className="text-xs flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors font-bold"
                >
                    <Download size={14} /> Exportar Excel
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10">Mes</th>
                            <th className="px-4 py-3 text-right">Cuota (Bolsillo)</th>
                            <th className="px-4 py-3 text-right text-rose-500 font-bold">Int. Neto</th>
                            <th className="px-4 py-3 text-right text-slate-400 text-xs hidden sm:table-cell">Seguros</th>
                            <th className="px-4 py-3 text-right bg-blue-50/50 text-blue-700 border-l border-blue-100">Capital Base</th>
                            <th className="px-4 py-3 text-right bg-emerald-50/50 text-emerald-600 font-bold">Abono Extra</th>
                            <th className="px-4 py-3 text-right bg-indigo-50/50 text-indigo-700 font-black border-r border-indigo-100">Total Capital</th>
                            <th className="px-4 py-3 text-right">Saldo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {results.schedule.slice(0, 150).map((row) => (
                            <tr key={row.month} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-4 py-3 font-medium text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors">
                                    {row.month}
                                </td>
                                <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.paymentTotal)}</td>
                                <td className="px-4 py-3 text-right text-rose-500 font-bold">{formatCurrency(row.interestNet)}</td>
                                <td className="px-4 py-3 text-right text-slate-400 text-xs hidden sm:table-cell">{formatCurrency(row.insurance)}</td>
                                <td className="px-4 py-3 text-right text-blue-700 bg-blue-50/30 border-l border-blue-50">{formatCurrency(row.capitalOrdinary)}</td>
                                <td className="px-4 py-3 text-right text-emerald-600 font-bold bg-emerald-50/30">
                                    {row.extraApplied > 0 ? "+" + formatCurrency(row.extraApplied) : "-"}
                                </td>
                                <td className="px-4 py-3 text-right text-indigo-700 font-black bg-indigo-50/30 border-r border-indigo-50">{formatCurrency(row.capitalTotal)}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-700">{formatCurrency(row.balance)}</td>
                            </tr>
                        ))}
                        {results.schedule.length > 150 && (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-slate-400 text-xs italic">
                                    ... Mostrando primeros 150 meses. Descarga el CSV para ver todo ...
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold text-xs border-t-2 border-slate-200">
                        <tr>
                            <td className="px-4 py-3 sticky left-0 bg-slate-100">TOTALES</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(results.metrics.totalPaymentNew)}</td>
                            <td className="px-4 py-3 text-right text-rose-600">
                                {formatCurrency(results.metrics.totalPaymentNew - results.metrics.totalCapitalPaid - results.metrics.totalInsurancePaid)}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-500 hidden sm:table-cell">
                                {formatCurrency(results.metrics.totalInsurancePaid)}
                            </td>
                            <td colSpan="2" className="text-right px-4 py-3 text-indigo-800 uppercase tracking-wider">
                                Capital Pagado:
                            </td>
                            <td className="px-4 py-3 text-right text-indigo-800 bg-indigo-100">
                                {formatCurrency(results.metrics.totalCapitalPaid)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

// ============================================================================
// CREDIMASTER PRO V4.0 - PARTE 7/7
// Componente Principal, Vista IA Advisor y Render Final
// ============================================================================

import { React, useState, useEffect, useMemo, createRoot } from './imports-and-context.js';
import { 
    PieChart, Calculator, List, BrainCircuit, FileText, Settings,
    TrendingDown, ChevronRight, Code2, Sparkles, Target
} from './imports-and-context.js';
import { ToastProvider } from './imports-and-context.js';
import { useDebounce } from './utilities-and-components.js';
import { CreditParametersForm } from './form-components.js';
import { calculateEngine } from './calculation-engine.js';
import { DashboardView, BudgetView } from './dashboard-views.js';
import { LegalGenerator, ScheduleView } from './legal-table-views.js';

// ============================================================================
// VISTA: IA ADVISOR (ANÁLISIS INTELIGENTE)
// ============================================================================

const AdvisorView = ({ metrics, inputs }) => {
    const [aiReport, setAiReport] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = () => {
        setIsGenerating(true);
        
        setTimeout(() => {
            const savings = Math.round(metrics.interestSaved);
            const years = Math.floor(metrics.monthsSaved / 12);
            const months = metrics.monthsSaved % 12;
            const timeReduction = metrics.timeReductionPct.toFixed(1);
            
            let report = `📊 **Análisis Inteligente de tu Estrategia**\n\n`;
            
            // Análisis de ahorro
            if (savings > 0) {
                const salarios = (savings / 1300000).toFixed(1);
                report += `✅ **Ahorro Proyectado:** Estás ahorrando $${(savings/1000000).toFixed(1)} millones en intereses (equivalente a ${salarios} salarios mínimos). `;
                
                if (savings > 50000000) {
                    report += `¡Este es un ahorro excepcional! `;
                } else if (savings > 20000000) {
                    report += `Este es un ahorro significativo. `;
                }
            }
            
            // Análisis de tiempo
            report += `\n\n⏱️ **Reducción de Plazo:** Terminarás tu crédito ${years} años`;
            if (months > 0) report += ` y ${months} meses`;
            report += ` antes (reducción del ${timeReduction}%). `;
            
            if (metrics.timeReductionPct > 30) {
                report += `¡Estás acelerando tu libertad financiera de forma extraordinaria!`;
            } else if (metrics.timeReductionPct > 15) {
                report += `Este es un avance sólido hacia tu libertad financiera.`;
            }
            
            // Análisis UVR
            if (metrics.isUVR) {
                report += `\n\n🏠 **Crédito UVR:** Dado que tu crédito está indexado a UVR, los abonos extraordinarios son CRÍTICOS. La inflación hace crecer tu deuda en pesos, pero tus abonos van directamente a reducir el capital en unidades UVR, lo que evita el efecto exponencial de la indexación.`;
            }
            
            // Análisis FRECH
            if (metrics.hasFrech) {
                const frechBenefit = (metrics.totalFrechBenefit / 1000000).toFixed(1);
                report += `\n\n🎁 **Subsidio FRECH:** El subsidio te está aportando $${frechBenefit} millones durante su vigencia. Aprovecha este periodo para hacer abonos agresivos, ya que cada peso que abones tiene doble impacto.`;
            }
            
            // Recomendaciones
            report += `\n\n💡 **Recomendaciones:**\n`;
            
            if (inputs.annualIncrease === 0) {
                report += `• Considera activar el "Incremento Anual" en tu estrategia. Aumentar tu abono un 5-10% cada año (efecto bola de nieve) puede reducir años adicionales de deuda.\n`;
            } else {
                report += `• ✅ Excelente: Estás usando el efecto "bola de nieve" con incremento anual del ${inputs.annualIncrease}%.\n`;
            }
            
            if (!inputs.usePrimas) {
                report += `• Activa "Usar Primas" para duplicar tu abono en junio y diciembre. Esto acelera significativamente la reducción de tu deuda.\n`;
            }
            
            if (inputs.extraMonthly < 200000) {
                report += `• Tu abono mensual es conservador. Si tu flujo de caja lo permite, considera aumentarlo para maximizar el ahorro en intereses.\n`;
            }
            
            report += `\n📈 **Conclusión:** Tu estrategia está bien encaminada. Mantén la disciplina y ajusta según tu capacidad financiera. ¡La libertad financiera está más cerca de lo que piensas!`;
            
            setAiReport(report);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-0 animate-in fade-in">
            <div className="bg-indigo-900 rounded-3xl p-8 text-white text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
                        <BrainCircuit size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">IA Advisor Pro</h2>
                    <p className="text-indigo-200 mb-6 text-sm max-w-md mx-auto">
                        Analiza tu estrategia de amortización y obtén recomendaciones personalizadas basadas en tus datos.
                    </p>
                    
                    <button 
                        onClick={handleGenerateReport} 
                        disabled={isGenerating}
                        className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center mx-auto gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles size={18} /> 
                        {isGenerating ? 'Analizando...' : 'Generar Reporte'}
                    </button>
                    
                    {aiReport && (
                        <div className="mt-6 text-left bg-white/10 p-5 rounded-xl border border-white/10 text-sm leading-relaxed animate-in fade-in whitespace-pre-line">
                            {aiReport}
                        </div>
                    )}
                </div>
                <div className="absolute top-0 right-0 opacity-10 p-10">
                    <BrainCircuit size={150}/>
                </div>
            </div>
            
            {/* Consejos adicionales */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-indigo-600"/>
                    Consejos Financieros
                </h3>
                <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="text-lg">💰</span>
                        <div>
                            <strong className="text-slate-800">Prioriza el crédito hipotecario:</strong>
                            <span className="block text-xs mt-1">Es la deuda más grande y de mayor plazo. Cada peso que abones hoy te ahorra intereses compuestos por décadas.</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="text-lg">📊</span>
                        <div>
                            <strong className="text-slate-800">Revisa tu extracto mensualmente:</strong>
                            <span className="block text-xs mt-1">Verifica que los abonos se estén aplicando correctamente al capital y no como adelanto de cuotas.</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="text-lg">🎯</span>
                        <div>
                            <strong className="text-slate-800">Usa el generador legal:</strong>
                            <span className="block text-xs mt-1">La carta de petición protege tus derechos bajo la Ley 546 de 1999 y asegura que el banco aplique tu abono correctamente.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENTE PRINCIPAL: APP
// ============================================================================

const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Estado principal con valores por defecto optimizados
    const [inputs, setInputs] = useState(() => {
        try {
            const saved = localStorage.getItem('credimaster_data_v4');
            return saved ? JSON.parse(saved) : getDefaultInputs();
        } catch (error) {
            console.error('Error loading saved data:', error);
            return getDefaultInputs();
        }
    });
    
    // Guardar en localStorage cuando cambien los inputs
    useEffect(() => {
        try {
            localStorage.setItem('credimaster_data_v4', JSON.stringify(inputs));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }, [inputs]);

    // Inicialización de UVR si es necesario
    useEffect(() => {
        if (inputs.isUVR && inputs.loanAmountUVR === 0 && inputs.loanAmount > 0 && inputs.uvrValue > 0) {
            setInputs(prev => ({
                ...prev, 
                loanAmountUVR: Math.round((prev.loanAmount / prev.uvrValue) * 10000) / 10000
            }));
        }
    }, []);

    // Debounce para evitar cálculos excesivos
    const debouncedInputs = useDebounce(inputs, 300);
    
    // Cálculo de resultados con memoización
    const results = useMemo(() => {
        try {
            return calculateEngine(debouncedInputs);
        } catch (error) {
            console.error('Error in calculation engine:', error);
            return null;
        }
    }, [debouncedInputs]);

    const handleInputChange = (field, value) => {
        setInputs(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyBudget = (amount) => {
        setInputs(prev => ({ ...prev, extraMonthly: Math.round(amount) }));
        setActiveTab('dashboard');
    };

    // Renderizado de contenido según tab activo
    const renderContent = () => {
        if (!results) {
            return (
                <div className="p-10 text-center text-slate-400">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full mb-4"></div>
                    <p>Cargando motor financiero v4.0...</p>
                </div>
            );
        }

        switch(activeTab) {
            case 'dashboard': 
                return <DashboardView metrics={results.metrics} graphData={results.graphData} />;
            case 'budget': 
                return <BudgetView onApplyExtra={handleApplyBudget} />;
            case 'advisor': 
                return <AdvisorView metrics={results.metrics} inputs={inputs} />;
            case 'schedule':
                return <ScheduleView results={results} inputs={inputs} />;
            case 'settings':
                return (
                    <div className="pb-24 animate-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 px-1">Configuración Avanzada</h2>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <CreditParametersForm 
                                inputs={inputs} 
                                handleInputChange={handleInputChange} 
                                setInputs={setInputs} 
                            />
                        </div>
                    </div>
                );
            case 'legal': 
                return <LegalGenerator inputs={inputs} />;
            default: 
                return null;
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Inicio', icon: PieChart },
        { id: 'budget', label: 'Estudio', icon: Calculator },
        { id: 'schedule', label: 'Tabla', icon: List },
        { id: 'advisor', label: 'IA Asesor', icon: BrainCircuit },
        { id: 'legal', label: 'Legal', icon: FileText },
    ];

    return (
        <ToastProvider>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col lg:flex-row overflow-hidden">
                {/* Sidebar Desktop */}
                <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-200 h-screen overflow-y-auto fixed left-0 top-0 z-30 shadow-xl lg:shadow-none no-print">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200/50">
                                <TrendingDown size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-xl leading-none text-slate-900 tracking-tight">
                                    CrediMaster
                                </h1>
                                <span className="text-[10px] text-blue-600 font-bold tracking-[0.2em] uppercase">
                                    Pro v4.0
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-8 flex-1">
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
                            <CreditParametersForm 
                                inputs={inputs} 
                                handleInputChange={handleInputChange} 
                                setInputs={setInputs} 
                            />
                        </div>
                        
                        <div className="pt-6 mt-auto text-center opacity-70 hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">
                                Desarrollado por
                            </p>
                            <div className="flex items-center justify-center gap-2 text-slate-600">
                                <Code2 size={14} className="text-blue-500" />
                                <span className="font-bold text-xs">Jose Mejia</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-80 h-screen overflow-y-auto bg-slate-50/50">
                    {/* Header Mobile */}
                    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 lg:hidden flex justify-between items-center no-print">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <TrendingDown size={16} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm leading-tight">CrediMaster</span>
                                <span className="text-[9px] text-slate-400 font-medium leading-tight">by jm_erazo</span>
                            </div>
                        </div>
                    </header>
                    
                    <div className="p-4 md:p-8 md:max-w-6xl md:mx-auto">
                        {renderContent()}
                    </div>
                </main>

                {/* Bottom Navigation Mobile */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 pb-safe px-2 py-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] no-print">
                    <div className="flex justify-around items-center">
                        {navItems.map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => setActiveTab(item.id)} 
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                                    activeTab === item.id ? 'text-blue-600' : 'text-slate-400'
                                }`}
                            >
                                <div className={`p-1 rounded-full mb-1 transition-all ${
                                    activeTab === item.id ? 'bg-blue-50 transform -translate-y-1' : ''
                                }`}>
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
                            <div className={`p-1 rounded-full mb-1 transition-all ${
                                activeTab === 'settings' ? 'bg-emerald-50 transform -translate-y-1' : ''
                            }`}>
                                <Settings size={20} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium">Ajustes</span>
                        </button>
                    </div>
                </nav>
            </div>
        </ToastProvider>
    );
};

// ============================================================================
// HELPERS
// ============================================================================

function getDefaultInputs() {
    return {
        loanAmount: 180000000,
        loanAmountUVR: 0,
        rateEA: 13.5,
        months: 240,
        insurance: 65000,
        insuranceIndexed: true,
        extraMonthly: 400000,
        annualIncrease: 0,
        oneTimePayment: 0,
        usePrimas: true,
        currentQuota: 0,
        calibrationCapital: 0,
        calibrationInterest: 0,
        isUVR: false,
        uvrValue: 360.5432,
        inflation: 4.5,
        hasFrech: false,
        frechPoints: 4.0,
        frechRemainingMonths: 84,
        frechMonthlyValue: 0
    };
}

// ============================================================================
// RENDER FINAL
// ============================================================================

const root = createRoot(document.getElementById('root'));
root.render(<App />);
