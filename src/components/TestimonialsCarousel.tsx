import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote: "La calculadora de plazos me dio la tranquilidad que necesitaba. Ya tengo mis penales listos.",
    author: "Carlos M.",
  },
  {
    quote: "El plan Pro de 9.99€ es la mejor inversión. La bóveda organiza todo por ti.",
    author: "Elena R.",
  },
  {
    quote: "Saber que un abogado revisa mis documentos antes de enviarlos me quita un peso de encima.",
    author: "Miguel A.",
  },
];

export const TestimonialsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();

    const autoplay = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => {
      clearInterval(autoplay);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Miles de personas ya confían en Albus para su proceso migratorio.
          </p>
        </div>

        <div className="max-w-2xl mx-auto overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((t) => (
              <div key={t.author} className="flex-[0_0_100%] min-w-0 px-4">
                <div className="bg-card border border-border rounded-xl p-8 md:p-10 text-center">
                  <Quote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg md:text-xl font-medium text-foreground mb-6 leading-relaxed">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-foreground text-foreground" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{t.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === selectedIndex ? "bg-foreground w-6" : "bg-border"
              )}
              aria-label={`Ir al testimonio ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
