import { PhotoGallery } from "@/components/ui/gallery";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export default function HomePage() {
  return (
    <BackgroundGradientAnimation>
      <main className="overflow-hidden">
        <PhotoGallery />
      </main>
    </BackgroundGradientAnimation>
  );
}
