import { Toaster } from "@/components/ui/toaster";
import { CasaProvider } from "@/contexts/CasaContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CasaProvider>
      <Component {...pageProps} />
      <Toaster />
    </CasaProvider>
  );
}
