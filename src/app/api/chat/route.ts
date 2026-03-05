import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import db from '@/lib/db';
import { subMonths, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';

export const maxDuration = 30;

const rangeEnum = z.enum(['month', 'quarter', 'year'])
  .describe('Rango de tiempo: month (este mes), quarter (este trimestre), year (este año).');

/** Devuelve la fecha de inicio según el rango */
function getDateFrom(range: 'month' | 'quarter' | 'year'): string {
  const now = new Date();
  if (range === 'year') return startOfYear(now).toISOString().split('T')[0];
  if (range === 'quarter') return startOfQuarter(now).toISOString().split('T')[0];
  return startOfMonth(now).toISOString().split('T')[0];
}

/** Llama a una ruta interna del API y devuelve data o lanza error */
async function fetchReport(path: string, params: Record<string, string | number>) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const res = await fetch(`${base}/api/reports/${path}?${qs}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Error desconocido');
  return json.data;
}

async function queryTopSalespeople(range: 'month' | 'quarter' | 'year', limit: number) {
  const fromStr = getDateFrom(range);
  const result = await db.query(`
    WITH sales_data AS (
      SELECT
        COALESCE(am.invoice_user_id, so.user_id) AS salesperson_id,
        COALESCE(p1.name, p2.name, u1.login, u2.login, 'Sin Asignar') AS salesperson_name,
        SUM(
          CASE
            WHEN am.type = 'out_invoice' THEN am.amount_total_signed
            WHEN am.type = 'out_refund' THEN -ABS(am.amount_total_signed)
            ELSE 0
          END
        ) AS total
      FROM account_move am
      LEFT JOIN sale_order so ON so.name = am.invoice_origin
      LEFT JOIN res_users u1 ON u1.id = am.invoice_user_id
      LEFT JOIN res_users u2 ON u2.id = so.user_id
      LEFT JOIN res_partner p1 ON p1.id = u1.partner_id
      LEFT JOIN res_partner p2 ON p2.id = u2.partner_id
      WHERE am.type IN ('out_invoice', 'out_refund')
        AND am.state = 'posted'
        AND am.invoice_date >= $1
      GROUP BY salesperson_id, salesperson_name
    )
    SELECT salesperson_name, COALESCE(total, 0) AS total
    FROM sales_data
    WHERE total > 0
    ORDER BY total DESC
    LIMIT $2
  `, [fromStr, limit]);
  return result.rows.map(row => ({
    salesperson_name: row.salesperson_name || 'Sin Asignar',
    total: parseFloat(row.total) || 0,
  }));
}

async function queryTopInvoices(range: 'month' | 'quarter' | 'year', limit: number) {
  const fromStr = getDateFrom(range);
  const result = await db.query(`
    SELECT
      am.name AS invoice_number,
      rp.name AS customer_name,
      am.invoice_date,
      am.amount_total_signed AS amount,
      am.state
    FROM account_move am
    JOIN res_partner rp ON rp.id = am.partner_id
    WHERE am.type = 'out_invoice'
      AND am.state = 'posted'
      AND am.invoice_date >= $1
    ORDER BY am.amount_total_signed DESC
    LIMIT $2
  `, [fromStr, limit]);
  return result.rows.map(row => ({
    invoice_number: row.invoice_number,
    customer_name: row.customer_name,
    invoice_date: row.invoice_date,
    amount: parseFloat(row.amount) || 0,
  }));
}

async function queryRecentInvoices(range: 'month' | 'quarter' | 'year', limit: number) {
  const fromStr = getDateFrom(range);
  const result = await db.query(`
    SELECT
      am.name AS invoice_number,
      rp.name AS customer_name,
      am.invoice_date,
      am.amount_total_signed AS amount,
      am.state
    FROM account_move am
    JOIN res_partner rp ON rp.id = am.partner_id
    WHERE am.type = 'out_invoice'
      AND am.state = 'posted'
      AND am.invoice_date >= $1
    ORDER BY am.invoice_date DESC
    LIMIT $2
  `, [fromStr, limit]);
  return result.rows.map(row => ({
    invoice_number: row.invoice_number,
    customer_name: row.customer_name,
    invoice_date: row.invoice_date,
    amount: parseFloat(row.amount) || 0,
  }));
}

function wrapTool<TParams extends z.ZodTypeAny>(
  description: string,
  parameters: TParams,
  execute: (args: z.infer<TParams>) => Promise<unknown>
) {
  return tool({
    description,
    parameters,
    execute: async (args: z.infer<TParams>) => {
      try {
        return await execute(args);
      } catch (error) {
        const msg = error instanceof Error ? error.message : JSON.stringify(error);
        console.error(`[chat tool] Error:`, msg);
        return { error: msg };
      }
    },
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    maxSteps: 10,
    system: `Eres un asistente experto en análisis de datos (Copiloto de Datos) para el dashboard ERP Odoo de Plastigesa.
Ayudas a gerentes y usuarios a entender métricas de ventas, facturación, clientes y operaciones.
Usa siempre las herramientas disponibles para obtener datos reales antes de responder.
Si el usuario no especifica rango de tiempo, usa "month" (este mes). Rangos: month, quarter, year.
Si una herramienta devuelve un campo "error", explica brevemente que no fue posible obtener ese dato.

## Reglas de formato de respuesta

**Montos:** Siempre con símbolo S/ y separadores de miles. Ejemplo: S/ 1,234,567.89
**Porcentajes:** Con 1 decimal. Ejemplo: 87.5%
**Fechas:** Formato DD/MM/YYYY.

**Listas de registros** (facturas, clientes, vendedores, productos):
Usa una tabla markdown con columnas relevantes. Ejemplo:
| # | Cliente | Factura | Fecha | Monto |
|---|---------|---------|-------|-------|
| 1 | Empresa SAC | FF01-001 | 05/03/2026 | S/ 1,200.00 |

**Estadísticas y métricas** (totales, comparaciones):
- Usa **negrita** para los valores clave.
- Agrupa métricas relacionadas con viñetas o en bloques.
- Incluye siempre una línea de resumen o conclusión al final.

**Rankings** (top vendedores, top clientes):
Usa numeración con emoji de medalla para los primeros 3: 🥇 🥈 🥉, luego números normales.

Sé conciso: no añadas frases de relleno como "espero que esto te ayude" o "si tienes más preguntas".`,
    messages,
    tools: {
      getSalesStats: wrapTool(
        'Estadísticas generales de ventas: total facturado, número de órdenes, ticket promedio, órdenes confirmadas.',
        z.object({ range: rangeEnum }),
        ({ range }) => fetchReport('sales-stats', { range })
      ),

      getTopSalespeople: wrapTool(
        'Ranking de los mejores vendedores por monto facturado.',
        z.object({ range: rangeEnum, limit: z.number().optional().describe('Cantidad de vendedores (default 5).') }),
        ({ range, limit = 5 }) => queryTopSalespeople(range, limit)
      ),

      getTopInvoices: wrapTool(
        'Las facturas con mayor monto del período. Útil para "las ventas más grandes", "top ventas" o "mayores ingresos".',
        z.object({
          range: rangeEnum,
          limit: z.number().optional().describe('Cantidad de facturas (default 10).'),
        }),
        ({ range, limit = 10 }) => queryTopInvoices(range, limit)
      ),

      getRecentInvoices: wrapTool(
        'Las facturas más recientes (últimas emitidas). Útil para "últimas órdenes", "últimas ventas" o "facturas recientes".',
        z.object({
          range: rangeEnum,
          limit: z.number().optional().describe('Cantidad de facturas (default 10).'),
        }),
        ({ range, limit = 10 }) => queryRecentInvoices(range, limit)
      ),

      getTopCustomers: wrapTool(
        'Los clientes con mayor volumen de compras facturadas.',
        z.object({ range: rangeEnum, limit: z.number().optional().describe('Cantidad de clientes (default 10).') }),
        ({ range, limit = 10 }) => fetchReport('top-customers', { range, limit })
      ),

      getInvoiceStats: wrapTool(
        'Estadísticas de facturación: total facturado, notas de crédito, neto, cantidad de facturas.',
        z.object({ range: rangeEnum }),
        ({ range }) => fetchReport('invoice-stats', { range })
      ),

      getSalesSummary: wrapTool(
        'Resumen de ventas con comparación respecto al período anterior y evolución.',
        z.object({ range: rangeEnum }),
        ({ range }) => fetchReport('sales-summary', { range })
      ),

      getSalesVsQuotes: wrapTool(
        'Comparación entre cotizaciones (presupuestos) y ventas confirmadas. Tasa de cierre.',
        z.object({ range: rangeEnum }),
        ({ range }) => fetchReport('sales-vs-quotes', { range })
      ),

      getConversionRate: wrapTool(
        'Tasa de conversión de cotizaciones a ventas confirmadas por vendedor o período.',
        z.object({ range: rangeEnum }),
        ({ range }) => fetchReport('conversion-rate', { range })
      ),

      getCustomerStats: wrapTool(
        'Estadísticas de clientes: nuevos clientes, clientes activos, clientes recurrentes.',
        z.object({ range: rangeEnum }),
        ({ range }) => fetchReport('customer-stats', { range })
      ),

      getPOSStats: wrapTool(
        'Estadísticas del punto de venta (POS/tienda): ventas, órdenes, ticket promedio en tienda.',
        z.object({ range: rangeEnum }),
        ({ range }) => fetchReport('pos-stats', { range })
      ),

      getPOSTopProducts: wrapTool(
        'Productos más vendidos en el punto de venta (POS/tienda).',
        z.object({
          range: rangeEnum,
          limit: z.number().optional().describe('Cantidad de productos (default 10).'),
        }),
        ({ range, limit = 10 }) => fetchReport('pos-top-products', { range, limit })
      ),

      getYearOverYear: wrapTool(
        'Comparación de ventas año contra año (YoY). Crecimiento porcentual respecto al año anterior.',
        z.object({ range: rangeEnum }),
        ({ range }) => fetchReport('year-over-year', { range })
      ),
    },
  });

  return result.toDataStreamResponse();
}
