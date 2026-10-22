import { ROAD_LINES, type Vec2 } from './cityLayout'

export const ROUTE_START: Vec2 = { x: ROAD_LINES[0], z: ROAD_LINES[ROAD_LINES.length - 1] }

export function buildRoutePath(destination: Vec2): Vec2[] {
  const nearestRoad = (coordinate: number) =>
    ROAD_LINES.reduce((nearest, road) =>
      Math.abs(road - coordinate) < Math.abs(nearest - coordinate) ? road : nearest,
    )
  const roadX = nearestRoad(destination.x)
  const roadZ = nearestRoad(destination.z)
  const points = [
    ROUTE_START,
    { x: roadX, z: ROUTE_START.z },
    { x: roadX, z: roadZ },
    { x: destination.x, z: roadZ },
    destination,
  ]

  return points.filter(
    (point, index) =>
      index === 0 ||
      Math.hypot(point.x - points[index - 1].x, point.z - points[index - 1].z) > 0.01,
  )
}
