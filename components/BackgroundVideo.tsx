"use client";

export default function BackgroundVideo() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Video di sfondo */}
      <video
        id="bg-video"
        className="w-full h-full object-cover opacity-80"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/background.mp4" type="video/mp4" />
        Il tuo browser non supporta il video di sfondo.
      </video>

      {/* Overlay gradiente per testi leggibili */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
    </div>
  );
}
