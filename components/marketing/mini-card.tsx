import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MiniCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  badge?: string;
  color?: "champagne" | "bordeaux" | "gold";
}

export function MiniCard({
  title,
  description,
  image,
  link,
  badge,
  color = "champagne",
}: MiniCardProps) {
  const badgeClasses = {
    champagne: "bg-champagne/10 text-champagne border-champagne/30",
    bordeaux: "bg-bordeaux/10 text-bordeaux border-bordeaux/30",
    gold: "bg-gold/10 text-gold border-gold/30",
  };

  return (
    <Link
      href={link}
      className="group relative block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/50"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url('${image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
        
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider border ${badgeClasses[color]}`}>
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-serif text-xl lg:text-2xl text-ivory mb-3 group-hover:text-champagne transition-colors">
          {title}
        </h3>
        <p className="text-base text-muted-grey mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center gap-2 text-sm text-champagne font-medium">
          <span>Découvrir</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-champagne/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>
  );
}
