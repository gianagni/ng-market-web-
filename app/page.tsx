import Hero from '../components/Hero';
import SubNavbar from '../components/SubNavbar';
import ProductSection from '../components/ProductSection';
import ServicesSection from '../components/ServicesSection';
import ExtrasSection from '../components/ExtrasSection';
import FaqSection from '../components/FaqSection'; 
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal'; // Import ini!

export default function Home() {
  return (
    <>
      <Hero />
      <SubNavbar /> 
      <ProductSection />
      <ServicesSection />
      <ExtrasSection />
      <FaqSection /> 
      <Footer />
      <AuthModal /> {/* Render di sini! */}
    </>
  );
}