"use client";

import { Control, useWatch, UseFormRegister, Controller } from "react-hook-form";
import { Invoice } from "./types";
import Image from "next/image";

interface InvoiceHeaderProps {
  control: Control<Invoice>;
  register: UseFormRegister<Invoice>;
  invoiceNumber: string;
}

/**
 * Componente de encabezado de factura
 * Muestra información de la empresa (izquierda) y datos de la factura (derecha)
 */
export default function InvoiceHeader({
  control,
  register,
  invoiceNumber,
}: InvoiceHeaderProps) {
  // Eliminamos useWatch innecesarios que causaban re-renders

  return (
    <div
      className="rounded-lg shadow-sm p-6 mb-6 invoice-header-print"
      style={{ backgroundColor: "#FEFEFE", border: "1px solid #74654F" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna Izquierda - Datos de Empresa */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/K.webp"
                alt="Logo"
                width={104}
                height={104}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#1F1E1D" }}>
                Pino's Enterprise Multiservices
              </h2>
            </div>
          </div>

          <div className="space-y-1 text-sm" style={{ color: "#74654F" }}>
            <p> 2301 W Shandon Ave Midland TX </p>
            <p>Tel: (432) 453-06118 </p>
          </div>
        </div>

        {/* Columna Derecha - Datos de Factura */}
        <div className="space-y-4 invoice-header-right">
          <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-4">
            {/* Date */}
            <div className="w-full md:w-40 invoice-field">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#1F1E1D" }}
              >
                Date
              </label>
              <Controller
                control={control}
                name="date"
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    type="date"
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value ? String(field.value).split('T')[0] : '')}
                    onChange={(e) => {
                      field.onChange(e.target.valueAsDate);
                    }}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none"
                    style={{ borderColor: "#74654F", borderWidth: "1px" }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#F89E1A";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 2px rgba(248, 158, 26, 0.2)";
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      e.currentTarget.style.borderColor = "#74654F";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                )}
              />
            </div>

            {/* Sold To */}
            <div className="w-full md:flex-1 invoice-field">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#1F1E1D" }}
              >
                Sold To
              </label>
              <input
                type="text"
                {...register("soldTo", { required: true })}
                placeholder="Nombre del cliente"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none"
                style={{ borderColor: "#74654F", borderWidth: "1px" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#F89E1A";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(248, 158, 26, 0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#74654F";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Invoice # */}
            <div className="w-full md:w-36 invoice-field">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#1F1E1D" }}
              >
                Invoice #
              </label>
              <div
                className="w-full px-3 py-2 border rounded-md invoice-number-field"
                style={{
                  backgroundColor: "#ECD8B6",
                  borderColor: "#74654F",
                  borderWidth: "1px",
                  color: "#1F1E1D",
                }}
              >
                {invoiceNumber}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
