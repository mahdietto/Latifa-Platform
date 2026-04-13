import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingShapes from "@/components/FloatingShapes";
import heroImg from "@/assets/hero-kids.png";

const GuestLanding = () => {
  const navigate = useNavigate();
  const [startClicked, setStartClicked] = useState(false);

  const handleStartLearning = () => {
    if (startClicked) return;
    setStartClicked(true);
    window.setTimeout(() => {
      navigate("/library");
    }, 520);
  };

  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center pt-16 overflow-hidden">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20">
        <h1
          className="text-5xl md:text-7xl text-foreground/90 drop-shadow-sm"
          style={{ fontFamily: "'Pinyon Script', cursive" }}
        >
        </h1>
      </div>
      <div className="absolute inset-0 z-0">
        <FloatingShapes />
      </div>
      <AnimatePresence>
        {!startClicked && (
          <motion.div
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-0 z-0 bg-white/60 backdrop-blur-2xl"
          />
        )}
      </AnimatePresence>
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6"
            >
              <span className="text-sm font-bold text-primary">Apprendre en s'amusant !</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 font-display">
            Là où les enfants <span className="text-gradient-fun">Découvrent</span>
              <br />
              & apprennent avec joie !
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 font-body">
            Des leçons interactives, des quiz amusants et des aventures magiques qui font de l'apprentissage un voyage passionnant pour chaque enfant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="h-12 px-7 rounded-xl font-semibold" onClick={handleStartLearning}>
                Explorer Gratuitement <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-8 justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {[].map((e, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-lg">
                    {e}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">5,000+ Des apprenants heureux</p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">⭐</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-3xl" />
              <img src={heroImg} alt="Kids learning together" className="relative w-full max-w-lg rounded-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GuestLanding;
