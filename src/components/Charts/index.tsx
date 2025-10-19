import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Paleta de colores sobrios y fríos
export const CHART_COLORS = {
  primary: '#4A90E2',      // Azul suave
  secondary: '#7ED321',    // Verde suave
  tertiary: '#F5A623',     // Naranja suave
  quaternary: '#BD10E0',   // Púrpura suave
  quinary: '#50E3C2',      // Turquesa
  senary: '#B8E986',       // Verde claro
  septenary: '#D0021B',    // Rojo suave
  octonary: '#9013FE',     // Violeta
  success: '#4CAF50',      // Verde éxito
  warning: '#FF9800',      // Naranja advertencia
  error: '#F44336',        // Rojo error
  info: '#2196F3',        // Azul información
  neutral: '#9E9E9E',      // Gris neutro
  dark: '#424242',         // Gris oscuro
  light: '#E0E0E0'        // Gris claro
};

export const CHART_COLOR_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.quinary,
  CHART_COLORS.senary,
  CHART_COLORS.septenary,
  CHART_COLORS.octonary
];

// Componente de gráfica de líneas
interface LineChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  title?: string;
  height?: number;
  color?: string;
}

export function CustomLineChart({ 
  data, 
  dataKey, 
  xAxisKey, 
  title, 
  height = 300, 
  color = CHART_COLORS.primary 
}: LineChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      {title && (
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey={xAxisKey} stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} 
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Componente de gráfica de barras
interface BarChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  title?: string;
  height?: number;
  color?: string;
}

export function CustomBarChart({ 
  data, 
  dataKey, 
  xAxisKey, 
  title, 
  height = 300, 
  color = CHART_COLORS.primary 
}: BarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      {title && (
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey={xAxisKey} stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} 
          />
          <Legend />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Componente de gráfica de área
interface AreaChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  title?: string;
  height?: number;
  color?: string;
}

export function CustomAreaChart({ 
  data, 
  dataKey, 
  xAxisKey, 
  title, 
  height = 300, 
  color = CHART_COLORS.primary 
}: AreaChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      {title && (
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey={xAxisKey} stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} 
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Componente de gráfica circular
interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  title?: string;
  height?: number;
  colors?: string[];
}

export function CustomPieChart({ 
  data, 
  dataKey, 
  nameKey, 
  title, 
  height = 300, 
  colors = CHART_COLOR_PALETTE 
}: PieChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      {title && (
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} 
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Componente de gráfica de barras múltiples
interface MultiBarChartProps {
  data: any[];
  dataKeys: string[];
  xAxisKey: string;
  title?: string;
  height?: number;
  colors?: string[];
}

export function CustomMultiBarChart({ 
  data, 
  dataKeys, 
  xAxisKey, 
  title, 
  height = 300, 
  colors = CHART_COLOR_PALETTE 
}: MultiBarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      {title && (
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey={xAxisKey} stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} 
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key}
              dataKey={key} 
              fill={colors[index % colors.length]} 
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
