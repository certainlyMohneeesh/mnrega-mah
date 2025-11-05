import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Code2, Database, Map, BarChart3, Globe, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About | MGNREGA India Dashboard",
  description: "Learn about the MGNREGA India Dashboard project and its creator Mohneesh Naidu",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            About This Project
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Making MGNREGA data accessible and actionable for everyone
          </p>
        </div>

        {/* Project Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We've Built</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            The <strong>MGNREGA India Dashboard</strong> is a comprehensive data visualization platform that brings transparency 
            to the Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) implementation across India. 
            Our mission is to make government employment data accessible, understandable, and actionable for citizens, 
            researchers, and policymakers.
          </p>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl">
              <Map className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Interactive Maps</h3>
                <p className="text-xs text-gray-600">Explore 36 states & 700+ districts with real-time GeoJSON visualization</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
              <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Data Analytics</h3>
                <p className="text-xs text-gray-600">Compare states, track trends, and analyze employment metrics</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
              <Database className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Comprehensive Database</h3>
                <p className="text-xs text-gray-600">14K+ data points updated regularly from official sources</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl">
              <Globe className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Multilingual Support</h3>
                <p className="text-xs text-gray-600">Access data in 9 Indian languages for wider reach</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technology Stack</h2>
          <div className="flex flex-wrap gap-3">
            {[
              "Next.js 15",
              "TypeScript",
              "Prisma ORM",
              "PostgreSQL",
              "Leaflet.js",
              "TailwindCSS",
              "shadcn/ui",
              "Framer Motion",
              "Vercel",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gradient-to-r from-accent-purple/10 to-brand/10 text-gray-700 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Creator Section */}
        <div className="bg-gradient-to-br from-accent-purple to-[#E76D67] rounded-2xl shadow-xl p-8 sm:p-10 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
              <Code2 className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-black text-2xl font-bold">Created by Mohneesh Naidu</h2>
              <p className="text-black/80 text-sm">Full-Stack Developer & Data Enthusiast</p>
            </div>
          </div>

          <p className="text-black/90 leading-relaxed mb-6">
            This project represents a commitment to open data, transparency, and leveraging technology 
            for social good. By making MGNREGA data accessible through interactive visualizations and 
            comprehensive analytics, we're empowering citizens to hold their government accountable 
            and make informed decisions.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://cyth.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-accent-purple rounded-lg font-semibold hover:bg-gray-900/90 transition-all transform hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Visit Portfolio</span>
            </a>
            <a
              href="https://github.com/certainlyMohneeesh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-black rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Key Achievements */}
        <div className="mt-8 grid sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl font-bold text-brand mb-2">36</div>
            <div className="text-sm text-gray-600">States & UTs Covered</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl font-bold text-accent-purple mb-2">700+</div>
            <div className="text-sm text-gray-600">Districts Tracked</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">14K+</div>
            <div className="text-sm text-gray-600">Data Points</div>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Data sourced from official MGNREGA portals • Map boundaries from{" "}
            <a
              href="https://github.com/udit-001/india-maps-data"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-purple hover:underline font-medium"
            >
              india-maps-data
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
