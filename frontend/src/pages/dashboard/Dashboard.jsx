import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import HeroSection from "../../components/dashboard/HeroSection";
import FilterSection from "../../components/dashboard/FilterSection";
import RecentLostItems from "../../components/dashboard/RecentLostItems";
import RecentFoundItems from "../../components/dashboard/RecentFoundItems";

export default function UserDashboard() {
  return (
    <>
      <Header />

      <HeroSection />
      <FilterSection />

      <RecentLostItems />
      <RecentFoundItems />

      <Footer />
    </>
  );
}
