import Aktivitas from "./Aktivitas";
import AppPromo from "./AppPromo";
import BuktiAlumni from "./BuktiAlumni";
import CtaBanner from "./CtaBanner";
import Faq from "./Faq";
import Footer from "./Footer";
import { Header, PromoBar } from "./Header";
import Hero from "./Hero";
import Keunggulan from "./Keunggulan";
import { MotionProvider } from "./motion";
import ProgramJenjang from "./ProgramJenjang";
import ProgramTabs from "./ProgramTabs";
import SchoolMarquee from "./SchoolMarquee";
import VideoStories from "./VideoStories";

/** Landing page "Home Option 2" from the Penpot wireframe, section by section. */
export default function HomeOption2() {
  return (
    <MotionProvider>
      <PromoBar />
      <Header active="Program" />
      <main>
        <Hero />
        <ProgramJenjang />
        <SchoolMarquee />
        <ProgramTabs />
        <Keunggulan />
        <BuktiAlumni />
        <VideoStories />
        <Aktivitas />
        <AppPromo />
        <CtaBanner />
        <Faq />
      </main>
      <Footer />
    </MotionProvider>
  );
}
