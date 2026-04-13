/**
 * Full-viewport looping video behind the app (public/images/bg.mp4).
 */
export default function AppVideoBackground() {
  return (
    <video
      className="pointer-events-none fixed inset-0 z-0 h-full min-h-full w-full min-w-full object-cover"
      src="/images/bg.mp4"
      poster="/images/bg.png"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}
