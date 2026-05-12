import { motion } from "framer-motion"
import Icon from "@/components/ui/icon"

export default function Overlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <span className="text-2xl">✨</span>
          <span className="font-serif text-white text-xl font-semibold tracking-wide">Загадай.Онлайн</span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pointer-events-auto flex items-center gap-2 bg-[#4C75A3] hover:bg-[#3d6291] text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
        >
          <Icon name="LogIn" size={15} />
          Войти через ВК
        </motion.button>
      </div>

      {/* Center hero */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="font-serif text-4xl md:text-6xl font-bold text-white text-center drop-shadow-lg mb-3"
        >
          Загадай мечту
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.9 }}
          className="text-white/70 text-base md:text-lg text-center max-w-sm px-6"
        >
          Тысячи людей уже загадали желания.<br />Твоя мечта станет частью этой галереи.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="pointer-events-auto mt-8 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-base px-8 py-3.5 rounded-full shadow-lg shadow-purple-900/40 transition-all hover:scale-105 active:scale-100"
        >
          <span className="text-lg">✨</span>
          Загадать желание
        </motion.button>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-3 text-white/40 text-xs"
        >
          от 10 ₽ — пожертвование на исполнение мечт
        </motion.p>
      </div>

      {/* Bottom stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 md:gap-16 px-4"
      >
        {[
          { value: "12 847", label: "желаний загадано" },
          { value: "4.2 млн ₽", label: "пожертвовано" },
          { value: "386", label: "исполнилось" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-white font-bold text-lg md:text-xl">{stat.value}</div>
            <div className="text-white/50 text-xs">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Drag hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-24 left-0 right-0 flex justify-center"
      >
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <Icon name="MousePointer2" size={12} />
          <span>Перетащи галерею</span>
        </div>
      </motion.div>

    </div>
  )
}
