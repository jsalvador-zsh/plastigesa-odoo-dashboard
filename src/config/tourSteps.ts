// src/config/tourSteps.ts
import { DriveStep } from "driver.js";
export const DASHBOARD_TOUR: DriveStep[] = [
  {
    element: "#tour-sidebar",
    popover: {
      title: "Panel de Navegación",
      description: "Aquí puedes navegar entre las diferentes secciones: Ventas, Clientes, Facturación y más.",
      side: "right"
    }
  },
  {
    element: "#tour-quick-stats",
    popover: {
      title: "Estadísticas Rápidas",
      description: "Un vistazo rápido a las métricas más importantes del día o mes.",
      side: "bottom"
    }
  },
  {
    element: "#tour-area-summaries",
    popover: {
      title: "Resúmenes por Área",
      description: "Información detallada segmentada por Ventas, POS y Facturación.",
      side: "top"
    }
  },
  {
    element: "#tour-charts",
    popover: {
      title: "Gráficos Visuales",
      description: "Visualiza la evolución de tus ventas y el rendimiento de tu equipo.",
      side: "top"
    }
  }
];
export const CUSTOMER_REPORT_TOUR: DriveStep[] = [
  {
    element: "#tour-customer-stats",
    popover: {
      title: "Métricas de Clientes",
      description: "Analiza el crecimiento de tu base de clientes y el ticket promedio.",
      side: "bottom"
    }
  },
  {
    element: "#tour-top-customers",
    popover: {
      title: "Clientes Destacados",
      description: "Identifica rápidamente quiénes son tus mejores clientes en el período seleccionado.",
      side: "right"
    }
  },
  {
    element: "#tour-new-customers",
    popover: {
      title: "Nuevos Clientes",
      description: "Revisa la evolución de adquisición de clientes mes a mes.",
      side: "left"
    }
  },
  {
    element: "#tour-latest-purchases",
    popover: {
      title: "Últimas Compras",
      description: "Un historial detallado de las transacciones más recientes.",
      side: "top"
    }
  },
  {
    element: "#tour-export-button",
    popover: {
      title: "Exportación de Datos",
      description: "Puedes descargar reportes detallados en formato Excel en cualquier momento.",
      side: "left"
    }
  }
];
export const SALES_SUMMARY_TOUR: DriveStep[] = [
  {
    element: "#tour-sales-stats",
    popover: {
      title: "Estadísticas de Ventas",
      description: "Resumen de cotizaciones y órdenes de venta confirmadas.",
      side: "bottom"
    }
  },
  {
    element: "#tour-sales-evolution",
    popover: {
      title: "Evolución de Ventas",
      description: "Gráfico interactivo de la tendencia de tus ingresos.",
      side: "top"
    }
  },
  {
    element: "#tour-sales-orders",
    popover: {
      title: "Listado de Órdenes",
      description: "Detalle completo de todas las operaciones de venta con filtros avanzados.",
      side: "top"
    }
  }
];
export const CUSTOMER_ANALYTICS_TOUR: DriveStep[] = [
  {
    element: "#tour-inactive-customers",
    popover: {
      title: "Clientes Inactivos",
      description: "Identifica clientes que no han realizado compras recientemente para estrategias de re-activación.",
      side: "bottom"
    }
  }
];
