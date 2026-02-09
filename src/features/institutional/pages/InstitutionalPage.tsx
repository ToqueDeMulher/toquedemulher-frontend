import { Link, useParams } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { routes } from "@/shared/lib/routes";

const PAGES: Record<string, { title: string; description: string }> = {
  blog: {
    title: "Blog",
    description: "Estamos preparando conteúdos especiais sobre beleza e bem-estar.",
  },
  contato: {
    title: "Fale Conosco",
    description: "Em breve você poderá falar com nosso time por aqui.",
  },
  rastreamento: {
    title: "Rastreamento",
    description: "Acompanhe seus pedidos em um painel dedicado (em breve).",
  },
  privacidade: {
    title: "Política de Privacidade",
    description: "Estamos organizando todos os detalhes da nossa política.",
  },
  termos: {
    title: "Termos de Uso",
    description: "Em breve, tudo sobre nossos termos de uso.",
  },
  pedidos: {
    title: "Meus Pedidos",
    description: "O histórico de pedidos estará disponível aqui em breve.",
  },
  desejos: {
    title: "Lista de Desejos",
    description: "Estamos preparando sua lista de favoritos.",
  },
  "trabalhe-conosco": {
    title: "Trabalhe Conosco",
    description: "Quer fazer parte do time? Estamos preparando este espaço.",
  },
  trocas: {
    title: "Trocas e Devoluções",
    description: "Em breve você verá nossa política completa de trocas.",
  },
};

function formatFallbackTitle(slug?: string) {
  if (!slug) return "Conteudo";
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function InstitutionalPage() {
  const { slug } = useParams();
  const data = slug ? PAGES[slug] : undefined;

  const title = data?.title ?? formatFallbackTitle(slug);
  const description =
    data?.description ??
    "Essa secao ainda esta sendo preparada. Volte em breve.";

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-16">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-pink-500">
          Institucional
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-gray-900">
          {title}
        </h1>
        <p className="mt-4 text-base text-gray-600 leading-relaxed">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" variant="default" asChild>
            <Link to={routes.home}>Voltar para a loja</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to={routes.help}>Central de ajuda</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
