// src/hooks/useCustomerAnalytics.ts
import { useQuery } from "@tanstack/react-query"

export function useCustomerAnalytics() {
  return useQuery({
    queryKey: ["customer-analytics"],
    queryFn: () =>
      fetch("/api/reports/customer-analytics").then((res) => res.json()),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
