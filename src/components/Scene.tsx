import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

function createFallbackTexture(color = "#6b21a8"): THREE.Texture {
  const canvas = document.createElement("canvas")
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext("2d")!
  const grad = ctx.createLinearGradient(0, 0, 128, 128)
  grad.addColorStop(0, color)
  grad.addColorStop(1, "#1e1b4b")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  ctx.fillStyle = "rgba(255,255,255,0.15)"
  ctx.font = "32px serif"
  ctx.textAlign = "center"
  ctx.fillText("✨", 64, 72)
  return new THREE.CanvasTexture(canvas)
}

function useTexturesSafe(urls: string[]): THREE.Texture[] {
  const uniqueUrls = [...new Set(urls)]
  const [textureMap, setTextureMap] = useState<Record<string, THREE.Texture>>({})

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    const fallback = createFallbackTexture()
    uniqueUrls.forEach((url) => {
      loader.load(
        url,
        (tex) => setTextureMap((prev) => ({ ...prev, [url]: tex })),
        undefined,
        () => setTextureMap((prev) => ({ ...prev, [url]: fallback }))
      )
    })
  }, [])

  return urls.map((url) => textureMap[url] ?? createFallbackTexture())
}

const BASE_IMAGES = [
  "https://cdn.poehali.dev/projects/564f53ff-4101-4c65-84f1-58368d479bbf/files/9fe6d16a-a501-4519-8cd6-23cd56517d1a.jpg",
  "https://cdn.poehali.dev/projects/564f53ff-4101-4c65-84f1-58368d479bbf/files/853973af-7957-44bf-b988-606f06538c4a.jpg",
  "https://cdn.poehali.dev/projects/564f53ff-4101-4c65-84f1-58368d479bbf/files/1c20393a-c43b-4e4f-bc55-3b90bc8002eb.jpg",
  "https://cdn.poehali.dev/projects/564f53ff-4101-4c65-84f1-58368d479bbf/files/b7d99ddf-1070-4c15-8dee-b6cdde211367.jpg",
  "https://cdn.poehali.dev/projects/564f53ff-4101-4c65-84f1-58368d479bbf/files/d5e0dcd7-4cac-4623-b269-5ff6cb567b9e.jpg",
  "https://cdn.poehali.dev/projects/564f53ff-4101-4c65-84f1-58368d479bbf/files/781a78b0-d680-4f2a-bc2d-aa14709b1ef7.jpg",
  "https://cdn.poehali.dev/projects/564f53ff-4101-4c65-84f1-58368d479bbf/files/bf08a836-7b0b-4a49-bc82-6198d4ede4e7.jpg",
  "https://cdn.poehali.dev/projects/564f53ff-4101-4c65-84f1-58368d479bbf/files/cebc4532-be49-4cb9-be40-b8a647a63ac3.jpg",
  "https://cdn.poehali.dev/projects/564f53ff-4101-4c65-84f1-58368d479bbf/files/1a8f8490-05de-4fbf-8689-9f7209c8f5a7.jpg",
  "https://cdn.poehali.dev/projects/564f53ff-4101-4c65-84f1-58368d479bbf/files/10b21b9e-fa61-4247-8a97-1a25677cdfba.jpg",
]

const TOTAL = 100

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

const images = Array.from({ length: TOTAL }, (_, i) => BASE_IMAGES[i % BASE_IMAGES.length])

const imagePositions = Array.from({ length: TOTAL }, (_, i) => {
  const layer = Math.floor(i / 10)
  const radius = 3.5 + layer * 1.8
  const baseAngle = (i % 10) * (Math.PI * 2 / 10)
  const yVariance = (seededRandom(i * 3) - 0.5) * 5
  const xOffset = (seededRandom(i * 7) - 0.5) * 1.2
  const zDepth = -(2 + seededRandom(i * 11) * 2.5)
  const x = Math.cos(baseAngle) * radius + xOffset
  const z = Math.sin(baseAngle) * radius * 0.4 + zDepth
  const rotY = (seededRandom(i * 5) - 0.5) * 0.8
  const scale = 0.55 + seededRandom(i * 13) * 0.35
  return {
    pos: [x, yVariance, z] as [number, number, number],
    rot: [0, rotY, 0] as [number, number, number],
    scale,
  }
})

interface FloatingImageProps {
  texture: THREE.Texture
  index: number
  rotation: number
}

const GLOW_COLORS = ["#a855f7", "#818cf8", "#60a5fa", "#f472b6", "#34d399", "#fbbf24"]

function createCircleMask(): THREE.Texture {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const grad = ctx.createRadialGradient(size/2, size/2, size*0.35, size/2, size/2, size/2)
  grad.addColorStop(0, "rgba(255,255,255,1)")
  grad.addColorStop(0.85, "rgba(255,255,255,1)")
  grad.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2)
  ctx.fill()
  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

const circleMask = createCircleMask()

function createGlowTexture(color: string): THREE.Texture {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  grad.addColorStop(0, color + "99")
  grad.addColorStop(0.5, color + "33")
  grad.addColorStop(1, "transparent")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

const glowTextures = GLOW_COLORS.map(createGlowTexture)

function FloatingImage({ texture, index, rotation }: FloatingImageProps) {
  const groupRef = useRef<THREE.Group>(null)
  const config = imagePositions[index]
  const glowTex = glowTextures[index % glowTextures.length]

  useFrame((state) => {
    if (!groupRef.current) return
    const targetRotY = config.rot[1] + rotation
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.12)
    const time = state.clock.getElapsedTime()
    groupRef.current.position.y = config.pos[1] + Math.sin(time * 0.5 + index) * 0.1
  })

  const r = 0.5

  return (
    <group ref={groupRef} position={config.pos} rotation={config.rot} scale={config.scale}>
      {/* Glow halo */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[r * 1.7, 64]} />
        <meshBasicMaterial map={glowTex} transparent opacity={0.7} depthWrite={false} />
      </mesh>
      {/* Photo circle */}
      <mesh>
        <circleGeometry args={[r, 64]} />
        <meshStandardMaterial
          map={texture}
          alphaMap={circleMask}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

function Stars({ count = 500, depth = 15, size = 0.015, bright = false }: { count?: number; depth?: number; size?: number; bright?: boolean }) {
  const points = useRef<THREE.Points>(null)
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40
    positions[i * 3 + 2] = -Math.random() * depth - 3
    const c = bright
      ? new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.8, 0.9)
      : new THREE.Color(1, 1, 1)
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))

  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.getElapsedTime() * 0.008
  })

  return (
    <points ref={points} geometry={geo}>
      <pointsMaterial size={size} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  )
}

function NebulaSpot({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!mesh.current) return
    const mat = mesh.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.12 + Math.sin(state.clock.getElapsedTime() * 0.4) * 0.04
  })
  return (
    <mesh ref={mesh} position={position}>
      <circleGeometry args={[size, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.14} depthWrite={false} />
    </mesh>
  )
}

export default function Scene() {
  const [rotation, setRotation] = useState(0)
  const [targetRotation, setTargetRotation] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [lastInteraction, setLastInteraction] = useState(Date.now())
  const { camera, size } = useThree()
  const mousePosition = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const dragRotation = useRef(0)

  const textures = useTexturesSafe(images)

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - dragStart.current.x
        const rotationAmount = (deltaX / size.width) * Math.PI * 2
        setTargetRotation(dragRotation.current + rotationAmount)
      } else {
        mousePosition.current = {
          x: (e.clientX / size.width) * 2 - 1,
          y: -(e.clientY / size.height) * 2 + 1,
        }
      }
      setLastInteraction(Date.now())
      setIsAutoPlaying(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [size])

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      dragStart.current = { x: e.clientX, y: e.clientY }
      dragRotation.current = targetRotation
      setLastInteraction(Date.now())
      setIsAutoPlaying(false)
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [targetRotation])

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      isDragging.current = true
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      dragRotation.current = targetRotation
      setLastInteraction(Date.now())
      setIsAutoPlaying(false)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current) {
        const deltaX = e.touches[0].clientX - dragStart.current.x
        const rotationAmount = (deltaX / size.width) * Math.PI * 2
        setTargetRotation(dragRotation.current + rotationAmount)
      }
      setLastInteraction(Date.now())
      setIsAutoPlaying(false)
    }

    const handleTouchEnd = () => {
      isDragging.current = false
    }

    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchmove", handleTouchMove)
    window.addEventListener("touchend", handleTouchEnd)
    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [targetRotation, size])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setTargetRotation((prev) => prev + Math.PI / 3)
        setLastInteraction(Date.now())
        setIsAutoPlaying(false)
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setTargetRotation((prev) => prev - Math.PI / 3)
        setLastInteraction(Date.now())
        setIsAutoPlaying(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    let isThrottled = false

    const handleWheel = (e: WheelEvent) => {
      if (isThrottled) return

      isThrottled = true
      setTimeout(() => {
        isThrottled = false
      }, 400)

      if (e.deltaY > 0) {
        setTargetRotation((prev) => prev + Math.PI / 3)
      } else {
        setTargetRotation((prev) => prev - Math.PI / 3)
      }

      setLastInteraction(Date.now())
      setIsAutoPlaying(false)
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [])

  // Auto-play after 3s of inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteraction
      if (timeSinceLastInteraction > 3000) {
        setIsAutoPlaying(true)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [lastInteraction])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setTargetRotation((prev) => prev + Math.PI / 3)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  useFrame(() => {
    if (!isDragging.current) {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mousePosition.current.x * 0.5, 0.1)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, mousePosition.current.y * 0.5, 0.1)
    }
    camera.lookAt(0, 0, 0)

    setRotation((prev) => THREE.MathUtils.lerp(prev, targetRotation, 0.12))
  })

  return (
    <>
      {/* Cosmic background */}
      <mesh position={[0, 0, -20]}>
        <planeGeometry args={[120, 80]} />
        <meshBasicMaterial color="#03001e" />
      </mesh>

      {/* Stars layer 1 — small distant */}
      <Stars count={1200} depth={18} size={0.012} />
      {/* Stars layer 2 — bigger near */}
      <Stars count={300} depth={8} size={0.025} bright />

      {/* Nebula glow spots */}
      <NebulaSpot position={[-8, 3, -15]} color="#4c1d95" size={12} />
      <NebulaSpot position={[6, -2, -14]} color="#1e1b4b" size={10} />
      <NebulaSpot position={[0, 5, -16]} color="#701a75" size={8} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 5]} intensity={0.8} color="#c084fc" />
      <pointLight position={[-10, 5, -5]} intensity={0.4} color="#818cf8" />
      <pointLight position={[10, -5, -5]} intensity={0.3} color="#f472b6" />

      {textures.map((texture, index) => (
        <FloatingImage key={index} texture={texture} index={index} rotation={rotation} />
      ))}
    </>
  )
}