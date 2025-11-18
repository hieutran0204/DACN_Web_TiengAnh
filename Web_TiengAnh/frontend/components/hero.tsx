"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image" // Thêm import này

const slides = [
  {
    id: 1,
    title: "Master English Pronunciation",
    description: "Improve your speaking skills with interactive pronunciation exercises",
    image: "/english-classroom-students-learning.jpg",
    cta: "Start Speaking",
  },
  {
    id: 2,
    title: "Expand Your Vocabulary",
    description: "Learn 5000+ words with context-based lessons and flashcards",
    image: "/vocabulary-words-learning.jpg",
    cta: "Build Vocabulary",
  },
  {
    id: 3,
    title: "Ace Your English Tests",
    description: "Practice with authentic test questions and get instant feedback",
    image: "/students-taking-exam-test.jpg",
    cta: "Take a Test",
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % slides.length)
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="mt-16 relative w-full overflow-hidden bg-white">
      <div className="relative h-96 md:h-[500px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
            <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4 max-w-2xl">{slide.title}</h2>
              <p className="text-lg md:text-xl text-white drop-shadow-md mb-8 max-w-xl">{slide.description}</p>
              <Button className="bg-primary hover:bg-accent text-primary-foreground text-lg px-8 py-3">
                {slide.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 transition"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-primary" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 transition"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-primary" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === current ? "bg-primary" : "bg-white/60 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
