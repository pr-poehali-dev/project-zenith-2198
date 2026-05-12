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

function FloatingImage({ texture, index, rotation }: FloatingImageProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const config = imagePositions[index]

  useFrame((state) => {
    if (!meshRef.current) return

    const targetRotY = config.rot[1] + rotation
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.12)

    const time = state.clock.getElapsedTime()
    meshRef.current.position.y = config.pos[1] + Math.sin(time * 0.5 + index) * 0.1
  })

  return (
    <mesh ref={meshRef} position={config.pos} rotation={config.rot} scale={config.scale}>
      <planeGeometry args={[0.833, 1.2]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.95}
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.1}
      />
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
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#ff6b35" />
      <spotLight position={[0, 5, 5]} intensity={0.3} angle={0.6} penumbra={1} />

      {textures.map((texture, index) => (
        <FloatingImage key={index} texture={texture} index={index} rotation={rotation} />
      ))}

      {/* Reflection plane */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0a0a0a" transparent opacity={0.2} roughness={0.1} metalness={0.9} />
      </mesh>
    </>
  )
}