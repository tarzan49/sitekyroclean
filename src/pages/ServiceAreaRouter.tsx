import { useParams } from "react-router-dom";
import LocationServicePage from "./LocationServicePage";
import FreguesiaServicePage from "./FreguesiaServicePage";

// 25 known city slugs — no data import needed, just strings
const CITY_SLUGS = new Set([
  "porto", "matosinhos", "maia", "vila-nova-de-gaia", "gondomar", "valongo",
  "povoa-de-varzim", "vila-do-conde", "paredes", "penafiel", "lousada",
  "pacos-de-ferreira", "felgueiras", "santo-tirso", "trofa", "espinho",
  "arouca", "braga", "guimaraes", "lisboa", "cascais", "oeiras",
  "sintra", "almada", "setubal",
]);

export default function ServiceAreaRouter() {
  const { "*": locationSlug = "" } = useParams();
  return CITY_SLUGS.has(locationSlug)
    ? <LocationServicePage />
    : <FreguesiaServicePage />;
}
