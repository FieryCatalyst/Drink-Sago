"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

export interface EditorialCocktail {
  id: string;
  name: string;
  image: string;
  notes: string[];
  product: string;
}

export const SAGO_EDITORIAL_COCKTAILS: EditorialCocktail[] = [
  {
    id: "sago-highball",
    name: "SAGO HIGHBALL",
    image: "/assets/cocktail-highball.png",
    notes: ["LIGHT HONEY", "CITRUS ZEST", "CLEAN OAK"],
    product: "Sago Oak Whisky",
  },
  {
    id: "sago-blood-sour",
    name: "SAGO-BLOOD SOUR",
    image: "/assets/sago-blood-sour.png",
    notes: ["TART HIBISCUS", "LEMON & HONEY", "AROMATIC BITTERS"],
    product: "Sago Oak Whisky",
  },
  {
    id: "sago-gold-rush",
    name: "SAGO GOLD RUSH",
    image: "/assets/cocktail.png",
    notes: ["WARMING GINGER", "TROPICAL PINEAPPLE", "EARTHY ROOIBOS"],
    product: "Sago Oak Whisky",
  },
  {
    id: "sago-after-dark",
    name: "SAGO AFTER DARK",
    image: "/assets/sago-after-dark.png",
    notes: ["RICH COFFEE", "BITTERSWEET CACAO", "SWEET VERMOUTH"],
    product: "Sago Oak Whisky",
  },
  {
    id: "apple-of-sagos-eye",
    name: "APPLE OF SAGO’S EYE",
    image: "/assets/cocktail4.png",
    notes: ["CRISP APPLE", "WARM CINNAMON", "CITRUS BITTERS"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "silky-sago-route",
    name: "SILKY SAGO ROUTE",
    image: "/assets/cocktail2.png",
    notes: ["COLD BREW", "SWEET VANILLA", "ORANGE ESSENCE"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "sagos-ruby-jewel",
    name: "SAGO’S RUBY JEWEL",
    image: "/assets/SAGO RUBY JWEL solid clr.png",
    notes: ["TART RASPBERRY", "CITRUS HONEY", "SWEET VANILLA"],
    product: "Sago Original Whisky",
  },
  {
    id: "cheeky-peachy-sago",
    name: "CHEEKY-PEACHY SAGO",
    image: "/assets/Cheeky Peach Sago Solid clrs.png",
    notes: ["JUICY PEACH", "LEMON ZEST", "CINNAMON FIZZ"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "sagos-plum-affair",
    name: "SAGO’S PLUM AFFAIR",
    image: "/assets/SAGOS PLUM AFAIR solid clr.png",
    notes: ["JUICY PLUM", "SPICED HONEY", "CINNAMON HEAT"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "sago-golden-hour",
    name: "SAGO GOLDEN HOUR",
    image: "/assets/cocktail3.png",
    notes: ["WARM HONEY", "CITRUS OILS", "CINNAMON BARK"],
    product: "Sago Original Whisky",
  },
  {
    id: "sago-toddy",
    name: "SAGO TODDY",
    image: "/assets/SAGO Toddy.png",
    notes: ["HOT APPLE", "LEMON & HONEY", "WHISKY WARMTH"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "sago-x-sago",
    name: "SAGO x SAGO",
    image: "/assets/SAGO X SAGO.png",
    notes: ["OAK & CINNAMON", "HONEY VANILLA", "ORANGE PEEL"],
    product: "Sago Original + Cinnamon",
  },
  {
    id: "sago-blackout",
    name: "SAGO BLACKOUT",
    image: "/assets/SAGO_BLACKOUT.png",
    notes: ["DEEP COFFEE", "VERMOUTH", "BITTERSWEET CACAO"],
    product: "Sago Original + Cinnamon",
  },
];

const BASE_COUNT = SAGO_EDITORIAL_COCKTAILS.length;
// 3 repeated sets for seamless infinite loop (39 total items instead of 65)
const COPIES = 3;
const REPEATED_COCKTAILS = Array.from({ length: COPIES }, () => SAGO_EDITORIAL_COCKTAILS).flat();

interface EditorialCocktailCarouselProps {
  onSelectRecipe?: (index: number) => void;
  activeRecipeIndex?: number;
  className?: string;
}

export default function EditorialCocktailCarousel({
  onSelectRecipe,
  activeRecipeIndex,
  className = "",
}: EditorialCocktailCarouselProps) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  // Start centered on the middle set
  const [featuredIndex, setFeaturedIndex] = useState(BASE_COUNT);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const lastWheelTimeRef = useRef(0);
  const isNormalizingRef = useRef(false);

  const scrollToIndex = useCallback((targetIdx: number, smooth = true) => {
    const el = trackRef.current;
    const card = cardRefs.current[targetIdx];
    if (!el || !card) return;

    setFeaturedIndex(targetIdx);
    const cardCenter = card.offsetLeft + card.clientWidth / 2;
    const targetScroll = cardCenter - el.clientWidth / 2;

    el.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Initialize track position centered on middle copy
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToIndex(BASE_COUNT, false);
    }, 40);
    return () => clearTimeout(timer);
  }, [scrollToIndex]);

  // Synchronize with external active recipe if provided
  useEffect(() => {
    if (typeof activeRecipeIndex === "number" && activeRecipeIndex >= 0) {
      const targetIdx = BASE_COUNT + (activeRecipeIndex % BASE_COUNT);
      scrollToIndex(targetIdx, true);
    }
  }, [activeRecipeIndex, scrollToIndex]);

  // Recenter current card on window resize without animation
  useEffect(() => {
    const handleResize = () => {
      scrollToIndex(featuredIndex, false);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [featuredIndex, scrollToIndex]);

  // Arrow click handler: moves exactly 1 card per click
  const scrollByDirection = useCallback((direction: "left" | "right") => {
    const nextIdx = direction === "left" ? featuredIndex - 1 : featuredIndex + 1;
    scrollToIndex(nextIdx, true);

    // Silent seamless wrap normalization
    setTimeout(() => {
      if (isNormalizingRef.current) return;
      const el = trackRef.current;
      const card0 = cardRefs.current[0];
      const cardN = cardRefs.current[BASE_COUNT];
      if (!el || !card0 || !cardN) return;

      const oneSetWidth = cardN.offsetLeft - card0.offsetLeft;
      if (oneSetWidth <= 0) return;

      if (nextIdx >= BASE_COUNT * 2) {
        isNormalizingRef.current = true;
        el.scrollTo({ left: el.scrollLeft - oneSetWidth, behavior: "auto" });
        setFeaturedIndex(nextIdx - BASE_COUNT);
        isNormalizingRef.current = false;
      } else if (nextIdx < BASE_COUNT) {
        isNormalizingRef.current = true;
        el.scrollTo({ left: el.scrollLeft + oneSetWidth, behavior: "auto" });
        setFeaturedIndex(nextIdx + BASE_COUNT);
        isNormalizingRef.current = false;
      }
    }, 300);
  }, [featuredIndex, scrollToIndex]);

  const snapToClosest = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closestIdx = featuredIndex;
    let minDiff = Infinity;
    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const diff = Math.abs(cardCenter - center);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    scrollToIndex(closestIdx, true);
  }, [featuredIndex, scrollToIndex]);

  // Touch handlers with real-time tracking
  const onTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.touches[0].clientX;
    dragStartScrollLeftRef.current = trackRef.current ? trackRef.current.scrollLeft : 0;
    dragDistanceRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const deltaX = e.touches[0].clientX - dragStartXRef.current;
    dragDistanceRef.current = deltaX;
    trackRef.current.scrollLeft = dragStartScrollLeftRef.current - deltaX;
  };

  const onTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const dist = dragDistanceRef.current;
    if (dist < -35) {
      scrollByDirection("right");
    } else if (dist > 35) {
      scrollByDirection("left");
    } else {
      snapToClosest();
    }
  };

  // Mouse drag handlers with real-time 1:1 responsive tracking
  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = trackRef.current ? trackRef.current.scrollLeft : 0;
    dragDistanceRef.current = 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    dragDistanceRef.current = deltaX;
    trackRef.current.scrollLeft = dragStartScrollLeftRef.current - deltaX;
  };

  const onMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const dist = dragDistanceRef.current;
    if (dist < -35) {
      scrollByDirection("right");
    } else if (dist > 35) {
      scrollByDirection("left");
    } else if (Math.abs(dist) > 5) {
      snapToClosest();
    }
  };

  const onMouseLeave = () => {
    if (isDraggingRef.current) {
      onMouseUp();
    }
  };

  // Trackpad / wheel horizontal swipe
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 15) {
      const now = Date.now();
      if (now - lastWheelTimeRef.current > 240) {
        lastWheelTimeRef.current = now;
        if (e.deltaX > 0) {
          scrollByDirection("right");
        } else {
          scrollByDirection("left");
        }
      }
    }
  };

  const handleCardClick = (index: number) => {
    if (Math.abs(dragDistanceRef.current) > 8) return;
    if (index === featuredIndex) {
      const originalIndex = index % BASE_COUNT;
      if (onSelectRecipe) {
        onSelectRecipe(originalIndex);
      } else {
        router.push(`/cocktails`);
      }
    } else {
      scrollToIndex(index, true);
    }
  };

  return (
    <div className={`editorial-carousel-container ${className}`.trim()}>
      {/* Floating side arrows */}
      <button
        type="button"
        onClick={() => scrollByDirection("left")}
        className="editorial-carousel__side-arrow editorial-carousel__side-arrow--prev is-active"
        aria-label="Previous cocktail"
      >
        <ArrowLeft size={20} />
      </button>

      <button
        type="button"
        onClick={() => scrollByDirection("right")}
        className="editorial-carousel__side-arrow editorial-carousel__side-arrow--next is-active"
        aria-label="Next cocktail"
      >
        <ArrowRight size={20} />
      </button>

      <div
        ref={trackRef}
        className="editorial-carousel-track"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onWheel={onWheel}
        tabIndex={0}
        role="region"
        aria-label="Sago signature cocktails carousel"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") scrollByDirection("left");
          if (e.key === "ArrowRight") scrollByDirection("right");
        }}
      >
        {REPEATED_COCKTAILS.map((cocktail, index) => {
          const isFeatured = index === featuredIndex;
          const isNearby = Math.abs(index - featuredIndex) <= 2;
          return (
            <article
              key={`${cocktail.id}-${index}`}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className={`editorial-card ${isFeatured ? "is-featured" : ""}`}
              onClick={() => handleCardClick(index)}
              role="button"
              tabIndex={0}
              aria-label={`View recipe for ${cocktail.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick(index);
                }
              }}
            >
              <div className="editorial-card__media">
                <Image
                  src={cocktail.image}
                  alt={cocktail.name}
                  fill
                  sizes={isFeatured ? "(max-width: 800px) 85vw, 420px" : "(max-width: 800px) 75vw, 340px"}
                  className="editorial-card__img"
                  draggable={false}
                  loading={isNearby ? "eager" : "lazy"}
                />
              </div>

              <div className="editorial-card__copy">
                <div className="editorial-card__head">
                  <h3 className="editorial-card__title">{cocktail.name}</h3>
                </div>
                <div className="editorial-card__notes">
                  {cocktail.notes.map((note, nIdx) => (
                    <span key={nIdx} className="editorial-card__note">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
