import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuentas Claras AR",
  description: "Seguimiento simple de ingresos y gastos en pesos argentinos.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
