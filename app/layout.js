import { Archivo, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ModalProvider } from '@/lib/contexts/ModalContext';
import Modal from '@/components/Modal';

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata = {
  title: "SSI Exam Portal | Coding & MCQ Assessment",
  description: "Official secure examination portal for Study Smart Innovations. Features proctored coding challenges and MCQ assessments.",
  keywords: "Study Smart Innovations, Exam Portal, Coding Exam, Programming Assessment, MCQ Exam",
  authors: [{ name: "Study Smart Innovations" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ModalProvider>
          {children}
          <Modal />
        </ModalProvider>
      </body>
    </html>
  );
}
