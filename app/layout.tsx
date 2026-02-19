import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recetas por Foto",
  description: "Sube una foto y obtiene receta completa para 2 personas."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
