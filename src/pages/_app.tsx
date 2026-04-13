import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { CasaProvider } from "@/contexts/CasaContext";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <ThemeProvider>
      <CasaProvider>
        <AnimatedBackground />
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={router.asPath}>
            <Component {...pageProps} />
          </PageTransition>
        </AnimatePresence>
        <Toaster />
      </CasaProvider>
    </ThemeProvider>
  );
}