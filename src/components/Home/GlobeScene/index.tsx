import GlobeSceneClient from "./GlobeSceneClient";

/**
 * Interactive, single-screen globe: spin/drag to explore, hover a glowing
 * beacon to reveal that destination's card. Markers/arcs are built client-side
 * from a curated destination list (see GlobeSceneClient).
 */
export default function GlobeScene() {
  return <GlobeSceneClient />;
}
