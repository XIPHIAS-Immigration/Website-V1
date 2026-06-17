import * as THREE from "three";

/**
 * Convert geographic coordinates to a point on a sphere of the given radius.
 * Matches the equirectangular convention used to generate the centroid/land
 * data (longitude east-positive, latitude north-positive).
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * A great-circle-ish arc between two coordinates, lifted off the surface by an
 * amount proportional to the distance between the endpoints.
 */
export function arcCurve(
  from: [number, number],
  to: [number, number],
  radius: number,
): THREE.QuadraticBezierCurve3 {
  const start = latLngToVector3(from[0], from[1], radius);
  const end = latLngToVector3(to[0], to[1], radius);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const lift = radius + start.distanceTo(end) * 0.5;
  mid.normalize().multiplyScalar(lift);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}
