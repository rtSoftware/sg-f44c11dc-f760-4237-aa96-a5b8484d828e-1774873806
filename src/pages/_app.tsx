import { Toaster } from "@/components/ui/toaster";
import { CasaProvider } from "@/contexts/CasaContext";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CasaProvider>
      <AnimatedBackground />
      <Component {...pageProps} />
      <Toaster />
    </CasaProvider>
  );
}
