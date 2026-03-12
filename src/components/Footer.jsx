import { Tv } from "lucide-react";

export default function Footer({ dark }) {
  return (
    <footer dir="rtl" className={`border-t py-8 ${dark ? "bg-black border-white/5" : "bg-white border-gray-200"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center">
              <Tv size={14} className="text-white" />
            </div>
            <span className={`font-black text-lg ${dark ? "text-white" : "text-black"}`} style={{ fontFamily: "'Cairo', sans-serif" }}>
              MrDB<span className="text-amber-500">.</span>
            </span>
          </div>
          <p className={`text-sm ${dark ? "text-zinc-600" : "text-gray-400"}`}>
            منصة تقييم الأنميات والسيريات العالمية • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
