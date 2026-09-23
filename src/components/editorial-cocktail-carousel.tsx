"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
    name: "SAGO HIGHBALL™",
    image: "/assets/cocktail-highball.png",
    notes: ["LIGHT HONEY", "CITRUS ZEST", "CLEAN OAK"],
    product: "Sago Oak Whisky",
  },
  {
    id: "sago-blood-sour",
    name: "SAGO-BLOOD SOUR™",
    image: "/assets/sago-blood-sour.png",
    notes: ["TART HIBISCUS", "LEMON & HONEY", "AROMATIC BITTERS"],
    product: "Sago Oak Whisky",
  },
  {
    id: "sago-gold-rush",
    name: "SAGO GOLD RUSH™",
    image: "/assets/cocktail.png",
    notes: ["WARMING GINGER", "TROPICAL PINEAPPLE", "EARTHY ROOIBOS"],
    product: "Sago Oak Whisky",
  },
  {
    id: "sago-after-dark",
    name: "SAGO AFTER DARK™",
    image: "/assets/sago-after-dark.png",
    notes: ["RICH COFFEE", "BITTERSWEET CACAO", "SWEET VERMOUTH"],
    product: "Sago Oak Whisky",
  },
  {
    id: "apple-of-sagos-eye",
    name: "APPLE OF SAGO’S EYE™",
    image: "/assets/cocktail4.png",
    notes: ["CRISP APPLE", "WARM CINNAMON", "CITRUS BITTERS"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "silky-sago-route",
    name: "SILKY SAGO ROUTE™",
    image: "/assets/cocktail2.png",
    notes: ["COLD BREW", "SWEET VANILLA", "ORANGE ESSENCE"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "sagos-ruby-jewel",
    name: "SAGO’S RUBY JEWEL™",
    image: "/assets/SAGO RUBY JWEL solid clr.png",
    notes: ["TART RASPBERRY", "CITRUS HONEY", "SWEET VANILLA"],
    product: "Sago Original Whisky",
  },
  {
    id: "cheeky-peachy-sago",
    name: "CHEEKY-PEACHY SAGO™",
    image: "/assets/Cheeky Peach Sago Solid clrs.png",
    notes: ["JUICY PEACH", "LEMON ZEST", "CINNAMON FIZZ"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "sagos-plum-affair",
    name: "SAGO’S PLUM AFFAIR™",
    image: "/assets/SAGOS PLUM AFAIR solid clr.png",
    notes: ["JUICY PLUM", "SPICED HONEY", "CINNAMON HEAT"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "spice-and-nice",
    name: "SPICE & NICE™",
    image: "/assets/1.png",
    notes: ["SWEET CINNAMON", "BRIGHT CITRUS", "TONIC BITTERS"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "sago-golden-hour",
    name: "SAGO GOLDEN HOUR™",
    image: "/assets/cocktail3.png",
    notes: ["WARM HONEY", "CITRUS OILS", "CINNAMON BARK"],
    product: "Sago Original Whisky",
  },
  {
    id: "sago-toddy",
    name: "SAGO TODDY™",
    image: "/assets/SAGO Toddy.png",
    notes: ["HOT APPLE", "LEMON & HONEY", "WHISKY WARMTH"],
    product: "Sago Cinnamon Whisky",
  },
  {
    id: "sago-x-sago",
    name: "SAGO x SAGO™",
    image: "/assets/SAGO X SAGO.png",
    notes: ["OAK & CINNAMON", "HONEY VANILLA", "ORANGE PEEL"],
    product: "Sago Original + Cinnamon",
  },
  {
    id: "sago-blackout",
    name: "SAGO BLACKOUT™",
    image: "/assets/8.png",
    notes: ["DEEP COFFEE", "VERMOUTH", "BITTERSWEET CACAO"],
    product: "Sago Original + Cinnamon",
  },
];

const BASE_COUNT = SAGO_EDITORIAL_COCKTAILS.length;
// 5 repeated sets for seamless infinite loop in both directions
const COPIES = 5;
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
  // Start centered in the middle copy (copy 2: index BASE_COUNT * 2 + 2)
  const [featuredIndex, setFeaturedIndex] = useState(BASE_COUNT * 2 + 2);

  // Drag interaction state
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const isInternalScrollRef = useRef(false);

  // Initialize track position in the middle copy
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const initialIdx = BASE_COUNT * 2 + 2;
    const card = cardRefs.current[initialIdx];
    if (card) {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      el.scrollLeft = cardCenter - el.clientWidth * 0.45;
      setFeaturedIndex(initialIdx);
    }
  }, []);

  // Synchronize with external active recipe if provided
  useEffect(() => {
    if (typeof activeRecipeIndex === "number" && activeRecipeIndex >= 0) {
      const targetIdx = BASE_COUNT * 2 + (activeRecipeIndex % BASE_COUNT);
      setFeaturedIndex(targetIdx);
      scrollToCard(targetIdx);
    }
  }, [activeRecipeIndex]);

  // Normalize scroll position for infinite continuous wrapping
  const normalizeInfiniteScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const card0 = cardRefs.current[0];
    const cardN = cardRefs.current[BASE_COUNT];
    if (!card0 || !cardN) return;

    const oneSetWidth = cardN.offsetLeft - card0.offsetLeft;
    if (oneSetWidth <= 0) return;

    // If scrolled past 3.5 sets, shift backward by 1 full set
    if (el.scrollLeft >= oneSetWidth * 3.5) {
      el.scrollLeft -= oneSetWidth;
    }
    // If scrolled before 1.2 sets, shift forward by 1 full set
    else if (el.scrollLeft <= oneSetWidth * 1.2) {
      el.scrollLeft += oneSetWidth;
    }
  };

  // Dynamically update featured cocktail based on scroll position
  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;

    normalizeInfiniteScroll();

    // Find the card closest to the primary viewing focus
    const viewportCenter = el.scrollLeft + el.clientWidth * 0.45;
    let closestIdx = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const dist = Math.abs(cardCenter - viewportCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setFeaturedIndex(closestIdx);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkScroll();
    const handleScroll = () => {
      if (isInternalScrollRef.current) return;
      window.requestAnimationFrame(checkScroll);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scrollToCard = (targetIdx: number) => {
    const el = trackRef.current;
    const card = cardRefs.current[targetIdx];
    if (!el || !card) return;

    isInternalScrollRef.current = true;
    const cardCenter = card.offsetLeft + card.clientWidth / 2;
    const targetScroll = cardCenter - el.clientWidth * 0.45;

    el.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: "smooth",
    });
    setFeaturedIndex(targetIdx);

    setTimeout(() => {
      isInternalScrollRef.current = false;
      normalizeInfiniteScroll();
      checkScroll();
    }, 450);
  };

  const scrollByDirection = (direction: "left" | "right") => {
    let nextIdx = direction === "left" ? featuredIndex - 1 : featuredIndex + 1;
    const el = trackRef.current;
    const card0 = cardRefs.current[0];
    const cardN = cardRefs.current[BASE_COUNT];
    
    // Seamless infinite wrap: keep the active window centered in the middle copies
    if (el && card0 && cardN) {
      const oneSetWidth = cardN.offsetLeft - card0.offsetLeft;
      if (oneSetWidth > 0) {
        if (nextIdx >= BASE_COUNT * 3.5) {
          el.scrollLeft -= oneSetWidth;
          nextIdx -= BASE_COUNT;
        } else if (nextIdx <= BASE_COUNT * 1.2) {
          el.scrollLeft += oneSetWidth;
          nextIdx += BASE_COUNT;
        }
      }
    }
    
    scrollToCard(nextIdx);
  };

  // Pointer drag handlers
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    hasMovedRef.current = false;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDownRef.current) return;
    const el = trackRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 6) {
      hasMovedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const onPointerUp = () => {
    isDownRef.current = false;
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 60);
  };

  const handleCardClick = (index: number) => {
    if (hasMovedRef.current) return;
    scrollToCard(index);
    const originalIndex = index % BASE_COUNT;
    if (onSelectRecipe) {
      onSelectRecipe(originalIndex);
    } else {
      router.push(`/cocktails`);
    }
  };

  const currentCocktail = REPEATED_COCKTAILS[featuredIndex] ?? SAGO_EDITORIAL_COCKTAILS[0];

  return (
    <div className={`editorial-carousel-container ${className}`.trim()}>
      {/* Floating side arrows vertically in the middle of card height */}
      <button
        type="button"
        onClick={() => scrollByDirection("left")}
        className="editorial-carousel__side-arrow editorial-carousel__side-arrow--prev is-active"
        aria-label="Scroll left to previous cocktail"
      >
        <ArrowLeft size={20} />
      </button>

      <button
        type="button"
        onClick={() => scrollByDirection("right")}
        className="editorial-carousel__side-arrow editorial-carousel__side-arrow--next is-active"
        aria-label="Scroll right to next cocktail"
      >
        <ArrowRight size={20} />
      </button>

      <div
        ref={trackRef}
        className="editorial-carousel-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        tabIndex={0}
        role="region"
        aria-label="Sago signature cocktails continuous carousel"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") scrollByDirection("left");
          if (e.key === "ArrowRight") scrollByDirection("right");
        }}
      >
        {REPEATED_COCKTAILS.map((cocktail, index) => {
          const isFeatured = index === featuredIndex;
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
                  sizes={isFeatured ? "(max-width: 800px) 85vw, 450px" : "(max-width: 800px) 75vw, 360px"}
                  className="editorial-card__img"
                  draggable={false}
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

      {/* Navigation arrows (horizontally centered in the middle, continuous scrolling without /14 limit) */}
      <div className="editorial-carousel__controls">
        <button
          type="button"
          onClick={() => scrollByDirection("left")}
          className="editorial-carousel__arrow editorial-carousel__arrow--prev is-active"
          aria-label="Previous cocktail"
        >
          <ArrowLeft size={18} />
        </button>

        <span className="editorial-carousel__indicator">
          <em>{currentCocktail.name.replace("™", "")}</em>
        </span>

        <button
          type="button"
          onClick={() => scrollByDirection("right")}
          className="editorial-carousel__arrow editorial-carousel__arrow--next is-active"
          aria-label="Next cocktail"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
