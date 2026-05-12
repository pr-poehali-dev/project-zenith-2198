import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import Scene from "./Scene"
import Overlay from "./Overlay"
import LoadingScreen from "./LoadingScreen"

export default function Gallery3D() {
  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 60%, #0d0520 0%, #03001e 60%, #000008 100%)" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true, alpha: false }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Overlay />
      <LoadingScreen />
    </div>
  )
}