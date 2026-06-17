import { getGlobeExplorerData } from "@/lib/globe-data";
import GlobeSceneClient from "./GlobeSceneClient";

/**
 * Server wrapper: provides the globe markers/arcs (from the programme
 * catalogue) to the cinematic, scroll-driven globe scene.
 */
export default function GlobeScene() {
  const { markers, arcs } = getGlobeExplorerData();
  if (!markers.length) return null;
  return <GlobeSceneClient markers={markers} arcs={arcs} />;
}
