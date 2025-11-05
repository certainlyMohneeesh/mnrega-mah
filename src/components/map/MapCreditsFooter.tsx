import { Github } from "lucide-react";

export function MapCreditsFooter() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>GeoJSON data credits:</span>
            <a
              href="https://github.com/udit-001/india-maps-data"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-accent-purple font-medium hover:text-accent-purple/80 hover:underline transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>Udit · india-maps-data</span>
            </a>
          </div>
          <div className="text-center sm:text-right text-gray-500">
            Thanks to the open-source community for making these boundaries available.
          </div>
        </div>
      </div>
    </footer>
  );
}
