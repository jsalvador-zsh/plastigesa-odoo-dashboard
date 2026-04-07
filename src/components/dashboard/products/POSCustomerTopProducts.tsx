"use client"
import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Package,
  User,
  Medal,
  RefreshCw,
  AlertCircle
} from "lucide-react"

import { formatCurrency } from "@/utils/chartUtils"

// Types
import type { POSCustomerSearchResult, POSCustomerTopProduct } from "@/services/posService"

export default function POSCustomerTopProducts() {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<POSCustomerSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<POSCustomerSearchResult | null>(null)
  
  const [topProducts, setTopProducts] = useState<POSCustomerTopProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search logic
  useEffect(() => {
    const fetchCustomers = async () => {
      if (query.trim().length < 2) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        const res = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.success) {
          setSearchResults(data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(fetchCustomers, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Fetch products top when customer selected
  useEffect(() => {
    if (!selectedCustomer) {
      setTopProducts([])
      return
    }

    const fetchTopProducts = async () => {
      setLoadingProducts(true)
      setError(null)
      try {
        const res = await fetch(`/api/reports/pos-customer-top-products?customerId=${selectedCustomer.id}&limit=5`)
        const data = await res.json()
        if (data.success) {
          setTopProducts(data.data)
        } else {
          setError(data.error)
        }
      } catch (err) {
        console.error(err)
        setError("Error al obtener los productos")
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchTopProducts()
  }, [selectedCustomer])

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Medal className="w-5 h-5 text-yellow-600" />
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (position === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="font-bold text-sm text-muted-foreground w-5 h-5 flex items-center justify-center">{position}</span>
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Top Productos por Cliente
        </CardTitle>
        <CardDescription>
          Busca un cliente para ver sus productos más comprados
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o DNI/RUC..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (selectedCustomer) setSelectedCustomer(null)
            }}
            className="pl-9"
          />
          {isSearching && (
            <RefreshCw className="absolute right-3 top-3 h-4 w-4 text-muted-foreground animate-spin" />
          )}

          {/* Autocomplete Dropdown */}
          {!selectedCustomer && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-48 overflow-y-auto">
              {searchResults.map((customer) => (
                <div
                  key={customer.id}
                  className="px-4 py-2 hover:bg-muted cursor-pointer text-sm flex justify-between"
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setQuery(customer.name)
                    setSearchResults([])
                  }}
                >
                  <span className="font-medium">{customer.name}</span>
                  {customer.vat && <span className="text-xs text-muted-foreground ml-2">{customer.vat}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[250px] relative">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!selectedCustomer ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
              <Search className="h-10 w-10 mb-3 opacity-20" />
              <p>Busca y selecciona un cliente para ver su top de compras</p>
            </div>
          ) : loadingProducts ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : topProducts.length > 0 ? (
            <div className="space-y-2">
              {topProducts.map((product, index) => {
                const position = index + 1
                return (
                  <div 
                    key={index} 
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="min-w-[2rem] flex justify-center">
                        {getPositionIcon(position)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={product.product_name}>
                          {product.product_name}
                        </p>
                        <div className="flex gap-4 mt-1 text-xs">
                          <span className="text-blue-600 font-medium">{product.quantity_sold} unid.</span>
                          <span className="text-green-600 font-medium">{formatCurrency(product.total_amount, "S/")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
              <Package className="h-10 w-10 mb-3 opacity-20" />
              <p>Este cliente no tiene productos con compras registradas</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
