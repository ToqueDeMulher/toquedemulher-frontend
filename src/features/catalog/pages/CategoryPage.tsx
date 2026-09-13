import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { CatalogListing } from "@/features/catalog/components/CatalogListing";
import { defaultCategorySlug, isCatalogCategorySlug } from "@/features/catalog/data/catalog-products";
import { useGamification } from "@/features/gamification/context/gamification-context";
import { routes } from "@/app/router/paths";
export function CategoryPage() {
 const { category } = useParams();
 const { trackCategoryView } = useGamification();
 useEffect(() => { if (isCatalogCategorySlug(category)) trackCategoryView(category); }, [category,trackCategoryView]);
 return isCatalogCategorySlug(category) ? <CatalogListing key={category} category={category}/> : <Navigate to={routes.category(defaultCategorySlug)} replace/>;
}