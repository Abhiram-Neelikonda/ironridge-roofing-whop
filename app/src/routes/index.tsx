import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Hero } from "../components/sections/Hero";
import { Services } from "../components/sections/Services";
import { Plans } from "../components/sections/Plans";
import { Process } from "../components/sections/Process";
import { Projects } from "../components/sections/Projects";
import { Financing } from "../components/sections/Financing";
import { Proof } from "../components/sections/Proof";
import { EstimateForm } from "../components/sections/EstimateForm";
import { site } from "../config/site";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <LocalBusinessSchema />
      <Header />
      <main>
        <Hero />
        <Services />
        <Plans />
        <Process />
        <Projects />
        <Financing />
        <Proof />
        <EstimateForm />
      </main>
      <Footer />
    </>
  );
}

function LocalBusinessSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    name: site.brand.name,
    telephone: site.contact.phone,
    email: site.contact.email,
    areaServed: site.serviceArea.cities,
    address: { "@type": "PostalAddress", addressLocality: site.contact.cityState },
    slogan: site.brand.tagline,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
