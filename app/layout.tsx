import type {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sommelier de Cervejas AI - Recomendações e Harmonizações',
  description: 'Seu especialista pessoal em cervejas artesanais. Descubra os estilos ideais para o seu paladar e as melhores harmonizações gastronômicas com IA.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning className="bg-[#0a0a0b] text-[#e1e1e1] font-sans antialiased min-h-screen selection:bg-[#c29b40]/25 selection:text-[#c29b40]">
        {children}
      </body>
    </html>
  );
}
