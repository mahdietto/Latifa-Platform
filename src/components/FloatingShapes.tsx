import { motion } from "framer-motion";

const shapes = [
  { size: "w-24 h-24", top: "8%", left: "6%", color: "bg-primary/15", delay: 0 },
  { size: "w-16 h-16", top: "20%", right: "10%", color: "bg-accent/20", delay: 0.8 },
  { size: "w-20 h-20", bottom: "16%", left: "10%", color: "bg-sky-300/20", delay: 1.2 },
  { size: "w-14 h-14", bottom: "24%", right: "12%", color: "bg-emerald-300/20", delay: 0.4 },
];

const FloatingShapes = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map((s, idx) => (
        <motion.div
          key={idx}
          className={`absolute rounded-full blur-sm ${s.size} ${s.color}`}
          style={{
            top: (s as any).top,
            left: (s as any).left,
            right: (s as any).right,
            bottom: (s as any).bottom,
          }}
          animate={{ y: [0, -16, 0], x: [0, 8, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6 + idx, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;
