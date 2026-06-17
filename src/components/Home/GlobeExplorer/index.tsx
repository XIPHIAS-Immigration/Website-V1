import { getGlobeExplorerData } from "@/lib/globe-data";
import GlobeExplorerClient from "./GlobeExplorerClient";

/**
 * Server wrapper: builds the globe dataset from the programme catalogue at
 * build/request time and hands the serialisable payload to the client globe.
 */
export default function GlobeExplorer() {
  const { markers, arcs, details, totalCountries, totalProgrammes } = getGlobeExplorerData();

  if (!markers.length) return null;

  return (
    <GlobeExplorerClient
      markers={markers}
      arcs={arcs}
      details={details}
      totalCountries={totalCountries}
      totalProgrammes={totalProgrammes}
    />
  );
}
