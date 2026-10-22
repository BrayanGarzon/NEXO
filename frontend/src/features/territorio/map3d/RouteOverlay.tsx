import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import type { DemoService } from '../../../types/catalog'
import type { Vec2 } from './cityLayout'
import { cityColors } from './palette3d'
import { buildRoutePath } from './routePath'

function RouteSegment({
  start,
  end,
  connector = false,
}: {
  start: Vec2
  end: Vec2
  connector?: boolean
}) {
  const from = new Vector3(start.x, 0.45, start.z)
  const to = new Vector3(end.x, 0.45, end.z)
  const direction = to.clone().sub(from)
  const length = direction.length()
  const quaternion = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction.normalize(),
  )

  const position = from.add(to).multiplyScalar(0.5)
  const outlineRadius = connector ? 0.32 : 0.46
  const routeRadius = connector ? 0.2 : 0.3

  return (
    <group position={position} quaternion={quaternion} renderOrder={10}>
      <mesh>
        <cylinderGeometry args={[outlineRadius, outlineRadius, length, 8]} />
        <meshBasicMaterial color={cityColors.routeOutline} depthTest={false} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[routeRadius, routeRadius, length, 8]} />
        <meshBasicMaterial color={cityColors.route} depthTest={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function RoutePath({ service, destination }: { service: DemoService; destination: Vec2 }) {
  const points = useMemo(() => buildRoutePath(destination), [destination])

  if (points.length < 2) return null

  return (
    <group name={`ruta-${service.id}`}>
      {points.slice(1).map((point, index) => (
        <RouteSegment
          key={`${index}-${point.x}-${point.z}`}
          start={points[index]}
          end={point}
          connector={index === points.length - 2}
        />
      ))}
      {[points[0], points[points.length - 1]].map((point, index) => (
        <group key={index === 0 ? 'inicio' : 'destino'} position={[point.x, 0.52, point.z]}>
          <mesh renderOrder={11}>
            <sphereGeometry args={[index === 0 ? 0.82 : 0.95, 16, 12]} />
            <meshBasicMaterial color={cityColors.routeOutline} depthTest={false} />
          </mesh>
          <mesh position={[0, 0.04, 0]} renderOrder={12}>
            <sphereGeometry args={[index === 0 ? 0.56 : 0.67, 16, 12]} />
            <meshBasicMaterial
              color={index === 0 ? '#ffffff' : cityColors.route}
              depthTest={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
