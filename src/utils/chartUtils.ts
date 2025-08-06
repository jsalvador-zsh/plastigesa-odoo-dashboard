// src/utils/chartUtils.ts
import type { Customer, FilterOptions, TimeRange, TopLimit } from "@/types/dashboard"

// Opciones de filtros
export const RANGE_OPTIONS: FilterOptions<TimeRange>[] = [
  { value: "month", label: "Mes" },
  { value: "quarter", label: "Trim." },
  { value: "year", label: "Año" }
]
export function formatCurrency(
  value: number | string | any[], 
  currency: string = "PEN"
): string {
  let num: number
  
  if (typeof value === "number") {
    num = value
  } else if (Array.isArray(value)) {
    num = parseFloat(value.join(""))
  } else {
    num = parseFloat(value)
  }
  
  return isNaN(num) ? `${currency} 0.00` : `${currency} ${num.toFixed(2)}`
}

// Formatear nombres para etiquetas del eje X
export function formatCustomerName(name: string, maxLength: number = 3): string {
  return name.slice(0, maxLength)
}

// Obtener descripción del período actual
export function getCurrentPeriodDescription(range: TimeRange): string {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  switch (range) {
    case "month":
      return `${monthNames[currentMonth - 1]} ${currentYear}`
      
    case "quarter":
      const currentQuarter = Math.ceil(currentMonth / 3)
      const quarterNames = {
        1: "Primer trimestre",
        2: "Segundo trimestre", 
        3: "Tercer trimestre",
        4: "Cuarto trimestre"
      }
      return `${quarterNames[currentQuarter as keyof typeof quarterNames]} ${currentYear}`
      
    case "year":
      return `Año ${currentYear}`
      
    default:
      return `${monthNames[currentMonth - 1]} ${currentYear}`
  }
}

export const LIMIT_OPTIONS: FilterOptions<TopLimit>[] = [
  { value: "10", label: "Top 10" },
  { value: "30", label: "Top 30" },
  { value: "50", label: "Top 50" }
]

// Configuración de colores para gráficos
export const CHART_COLORS = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  accent: "var(--chart-3)",
  muted: "var(--chart-4)",
  warning: "var(--chart-5)"
} as const

// Validar datos del gráfico
export function validateChartData(data: Customer[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false
  }
  
  return data.every(item => {
    const hasName = typeof item.customer_name === 'string' && item.customer_name.length > 0
    const hasAmount = typeof item.total_purchased === 'number' && 
                     !isNaN(item.total_purchased) && 
                     item.total_purchased >= 0
    
    return hasName && hasAmount
  })
}

// Calcular estadísticas básicas
export function calculateStats(data: Customer[]) {
  if (!data.length) return null
  
  const totals = data.map(c => c.total_purchased)
  const sum = totals.reduce((a, b) => a + b, 0)
  const avg = sum / totals.length
  const max = Math.max(...totals)
  const min = Math.min(...totals)
  
  return {
    total: sum,
    average: avg,
    maximum: max,
    minimum: min,
    count: data.length
  }
}

// Utilidades para contacto de clientes
export function formatPhone(phone: string | null, mobile: string | null): string | null {
  if (mobile) return mobile
  if (phone) return phone
  return null
}

export function getWhatsAppLink(phone: string | null, customerName: string): string | null {
  if (!phone) return null
  
  // Limpiar el teléfono (remover espacios, guiones, etc.)
  const cleanPhone = phone.replace(/[^\d+]/g, '')
  
  // Mensaje predeterminado
  const message = `Hola ${customerName}, te extrañamos como cliente. ¿Cómo podemos ayudarte?`
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

export function formatEmail(email: string | null): string | null {
  if (!email) return null
  return email.toLowerCase().trim()
}