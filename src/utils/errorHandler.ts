// src/utils/errorHandler.ts

export enum ErrorType {
  DATABASE = "DATABASE_ERROR",
  VALIDATION = "VALIDATION_ERROR", 
  NETWORK = "NETWORK_ERROR",
  AUTHENTICATION = "AUTH_ERROR",
  UNKNOWN = "UNKNOWN_ERROR"
}

export interface AppError {
  type: ErrorType
  message: string
  details?: any
  statusCode?: number
}

export class ErrorHandler {
  static createError(
    type: ErrorType,
    message: string, 
    details?: any,
    statusCode?: number
  ): AppError {
    return {
      type,
      message,
      details,
      statusCode
    }
  }

  static handleDatabaseError(error: any): AppError {
    console.error("Database error:", error)
    
    // Mapear errores comunes de PostgreSQL
    if (error.code) {
      switch (error.code) {
        case '23505':
          return this.createError(
            ErrorType.DATABASE,
            "Registro duplicado",
            error.detail,
            409
          )
        case '23503':
          return this.createError(
            ErrorType.DATABASE,
            "Referencia no válida",
            error.detail,
            400
          )
        case '42P01':
          return this.createError(
            ErrorType.DATABASE,
            "Tabla no encontrada",
            error.message,
            500
          )
        default:
          return this.createError(
            ErrorType.DATABASE,
            "Error de base de datos",
            error.message,
            500
          )
      }
    }

    return this.createError(
      ErrorType.DATABASE,
      "Error de conexión a la base de datos",
      error.message,
      500
    )
  }

  static handleValidationError(message: string, details?: any): AppError {
    return this.createError(
      ErrorType.VALIDATION,
      message,
      details,
      400
    )
  }

  static handleNetworkError(error: any): AppError {
    return this.createError(
      ErrorType.NETWORK,
      "Error de conexión de red",
      error.message,
      503
    )
  }

  static getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.DATABASE:
        return "Problema con la base de datos. Intenta nuevamente."
      case ErrorType.VALIDATION:
        return error.message
      case ErrorType.NETWORK:
        return "Problema de conexión. Verifica tu internet."
      case ErrorType.AUTHENTICATION:
        return "Problema de autenticación. Inicia sesión nuevamente."
      default:
        return "Algo salió mal. Intenta nuevamente."
    }
  }
}

// Middleware para APIs de Next.js
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof Error) {
        throw ErrorHandler.handleDatabaseError(error)
      }
      throw ErrorHandler.createError(
        ErrorType.UNKNOWN,
        "Error desconocido",
        error
      )
    }
  }
}