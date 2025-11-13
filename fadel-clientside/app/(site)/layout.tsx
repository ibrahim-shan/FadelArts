import Header from "@/components/header";
import Footer from "@/components/footer";
import { InitialSplash } from "@/components/initial-splash";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InitialSplash />
      <Header />
      {children}
      <Footer />
    </>
  );
}
