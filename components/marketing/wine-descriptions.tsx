import { CheckCircle } from "lucide-react";

const WINE_DESCRIPTIONS = [
  {
    id: 1,
    name: "Château Margaux 2015",
    region: "Margaux, Bordeaux",
    year: "2015",
    type: "Rouge",
    grape: "Cabernet Sauvignon, Merlot",
    kashrut: "Badatz Eda Haredit",
    kashrutLevel: "Mehadrin",
    description: "Un vin d'exception aux arômes de cassis, de violette et d'épices douces. Tanins soyeux et finale longue. Un grand cru classé qui incarne l'élégance bordelaise.",
    pairing: "Viandes rouges grillées, agneau, fromages affinés",
    servingTemp: "16-18°C",
    alcohol: "13.5%",
  },
  {
    id: 2,
    name: "Yarden Cabernet Sauvignon",
    region: "Golan Heights, Israël",
    year: "2020",
    type: "Rouge",
    grape: "Cabernet Sauvignon",
    kashrut: "Badatz Eda Haredit",
    kashrutLevel: "Mehadrin",
    description: "Un Cabernet Sauvignon puissant avec des notes de cerise noire, mûre et chêne. Structure élégante avec des tanins bien intégrés. Le fleuron des vins du Golan.",
    pairing: "Steak, barbecue, plats mijotés",
    servingTemp: "16-18°C",
    alcohol: "14%",
  },
  {
    id: 3,
    name: "Carmel Limited Edition",
    region: "Galilée, Israël",
    year: "2019",
    type: "Rouge",
    grape: "Syrah, Petit Verdot",
    kashrut: "Badatz Eda Haredit",
    kashrutLevel: "Mehadrin",
    description: "Une édition limitée complexe avec des arômes de fruits noirs, chocolat et épices. Vinifié en fûts de chêne français pour une texture veloutée.",
    pairing: "Canard, gibier, plats épicés",
    servingTemp: "16-18°C",
    alcohol: "14.5%",
  },
  {
    id: 4,
    name: "Tabor Shiraz",
    region: "Galilée, Israël",
    year: "2021",
    type: "Rouge",
    grape: "Shiraz",
    kashrut: "Rabbanut",
    kashrutLevel: "Casher",
    description: "Un Shiraz vibrant avec des notes de poivre noir, fruits rouges et légère fumée. Frais et accessible, parfait pour les repas quotidiens.",
    pairing: "Pâtes, pizza, viandes grillées",
    servingTemp: "15-17°C",
    alcohol: "13.5%",
  },
];

export function WineDescriptions() {
  return (
    <section className="relative py-20 bg-obsidian overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(197, 163, 90, 0.3) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm uppercase tracking-[0.4em] text-champagne mb-4">
            Notre Expertise
          </span>
          <h2 className="font-serif text-5xl lg:text-6xl xl:text-7xl text-ivory mb-4">
            Vins <span className="text-champagne">Casher</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-grey max-w-3xl mx-auto">
            Découvrez notre sélection de vins certifiés casher, soigneusement choisis pour leur qualité exceptionnelle et leur authenticité.
          </p>
        </div>

        {/* Wine Cards */}
        <div className="grid gap-8 lg:gap-12">
          {WINE_DESCRIPTIONS.map((wine, index) => (
            <div
              key={wine.id}
              className="group relative bg-warm-black rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-champagne/30 hover:shadow-2xl hover:shadow-champagne/10"
            >
              <div className="p-8 lg:p-12">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                  <div>
                    <h3 className="font-serif text-3xl lg:text-4xl text-ivory mb-2 group-hover:text-champagne transition-colors">
                      {wine.name}
                    </h3>
                    <p className="text-lg text-muted-grey">
                      {wine.region} • {wine.year}
                    </p>
                  </div>
                  
                  {/* Kashrut Badge */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-champagne/50 bg-champagne/10">
                    <CheckCircle className="h-5 w-5 text-champagne" />
                    <div>
                      <span className="text-xs uppercase tracking-wider text-champagne block">
                        {wine.kashrut}
                      </span>
                      <span className="text-[10px] text-champagne/80">
                        {wine.kashrutLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-lg text-ivory/80 leading-relaxed mb-8 max-w-3xl">
                  {wine.description}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-grey block mb-1">
                      Type
                    </span>
                    <span className="text-base text-ivory">{wine.type}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-grey block mb-1">
                      Cépages
                    </span>
                    <span className="text-base text-ivory">{wine.grape}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-grey block mb-1">
                      Accords
                    </span>
                    <span className="text-base text-ivory">{wine.pairing}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-grey block mb-1">
                      Service
                    </span>
                    <span className="text-base text-ivory">{wine.servingTemp}</span>
                  </div>
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-champagne to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Kashrut Info */}
        <div className="mt-16 bg-warm-black rounded-2xl border border-white/10 p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-champagne flex items-center justify-center bg-champagne/10">
                <CheckCircle className="h-10 w-10 text-champagne" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-2xl lg:text-3xl text-ivory mb-4">
                Certification Casher
              </h3>
              <p className="text-lg text-muted-grey leading-relaxed">
                Tous nos vins sont certifiés casher par les autorités rabbiniques reconnues. 
                Nous travaillons exclusivement avec des producteurs qui respectent les standards les plus stricts de la casherout, 
                garantissant une qualité et une authenticité sans compromis.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-ivory">
                <CheckCircle className="h-5 w-5 text-champagne" />
                <span>Badatz Eda Haredit</span>
              </div>
              <div className="flex items-center gap-2 text-ivory">
                <CheckCircle className="h-5 w-5 text-champagne" />
                <span>Rabbanut</span>
              </div>
              <div className="flex items-center gap-2 text-ivory">
                <CheckCircle className="h-5 w-5 text-champagne" />
                <span>Mehadrin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
