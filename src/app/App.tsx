import { AppRoutes } from "@/app/routes";
import { ScrollToTop } from "@/app/components/ScrollToTop";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}
