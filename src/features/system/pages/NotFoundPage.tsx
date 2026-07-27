import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { routes } from "@/app/router/paths";

export function NotFoundPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-20">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-pink-500">
          404
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-gray-900">
          Página não encontrada
        </h1>
        <p className="mt-4 text-base text-gray-600 leading-relaxed">
          A página que você tentou acessar não existe ou foi movida.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" variant="default" asChild>
            <Link to={routes.home}>Ir para a página inicial</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to={routes.help}>Central de ajuda</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
