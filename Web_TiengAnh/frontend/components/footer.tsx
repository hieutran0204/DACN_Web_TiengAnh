"use client"

import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">E</span>
              </div>
              <h3 className="text-xl font-bold">English Hub</h3>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Master English with interactive lessons, games, and comprehensive assessments.
            </p>
          </div>

          {/* Learning Paths */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Learning Paths</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tests" className="text-primary-foreground/80 hover:text-primary-foreground transition">
                  Mock Tests
                </Link>
              </li>
              <li>
                <Link href="/skills" className="text-primary-foreground/80 hover:text-primary-foreground transition">
                  Skill Assessment
                </Link>
              </li>
              <li>
                <Link
                  href="/vocabulary"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition"
                >
                  Vocabulary Builder
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-primary-foreground/80 hover:text-primary-foreground transition">
                  Reading Materials
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={18} className="flex-shrink-0 mt-0.5" />
                <span>support@englishhub.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="flex-shrink-0 mt-0.5" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                <span>123 Learning Ave, Education City</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-primary-foreground/70">&copy; {currentYear} English Hub. All rights reserved.</p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition">
              <Facebook size={20} />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition">
              <Twitter size={20} />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition">
              <Instagram size={20} />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition">
              <Linkedin size={20} />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
