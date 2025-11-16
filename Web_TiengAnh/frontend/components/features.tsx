import { BookOpen, Zap, MessageSquare, Newspaper, Gamepad2 } from "lucide-react"
import FeatureCard from "./feature-card"

const features = [
  {
    id: "tests",
    icon: BookOpen,
    title: "Mock Tests",
    description: "Prepare for TOEFL, IELTS, and other English proficiency tests with realistic practice exams",
    color: "bg-blue-100",
  },
  {
    id: "skills",
    icon: Zap,
    title: "Skill Tests",
    description: "Assess your listening, reading, writing, and speaking abilities with targeted skill assessments",
    color: "bg-cyan-100",
  },
  {
    id: "vocabulary",
    icon: MessageSquare,
    title: "Vocabulary",
    description: "Build your vocabulary with themed lessons, mnemonics, and spaced repetition techniques",
    color: "bg-blue-50",
  },
  {
    id: "articles",
    icon: Newspaper,
    title: "Articles",
    description: "Read engaging articles and news stories tailored to your English level",
    color: "bg-indigo-100",
  },
  {
    id: "games",
    icon: Gamepad2,
    title: "Learning Games",
    description: "Master English through interactive games, word puzzles, and language challenges",
    color: "bg-purple-100",
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Learning Modules</h2>
          <p className="text-lg text-muted-foreground">
            Chọn lộ trình học tập của bạn và bắt đầu cải thiện tiếng Anh ngay hôm nay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
