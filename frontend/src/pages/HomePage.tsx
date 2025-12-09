import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QUICK_CITIES_BY_ISLAND = {
  north: ["Auckland", "Hamilton", "Tauranga", "Wellington"],
  south: ["Christchurch", "Dunedin", "Nelson", "Queenstown"]
} as const;

const SCHOOL_TYPE_CARDS = [
  {
    key: "kindergarten",
    title: "Early childhood / Kindergarten",
    description: "Montessori, Reggio Emilia, play-based and bilingual centres.",
    to: "/kindergartens",
    bg: "bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100",
    emoji: "🧸"
  },
  {
    key: "primary",
    title: "Primary schools",
    description: "Years 1–6, local primary schools across New Zealand.",
    to: "/schools?school_type=primary",
    bg: "bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100",
    emoji: "📚"
  },
  {
    key: "intermediate",
    title: "Intermediate schools",
    description: "Years 7–8, bridging primary and secondary years.",
    to: "/schools?school_type=intermediate",
    bg: "bg-gradient-to-br from-indigo-100 via-slate-50 to-sky-100",
    emoji: "🧑‍🎓"
  },
  {
    key: "secondary",
    title: "Secondary schools",
    description: "NCEA, IB and Cambridge secondary schools (Years 9–13).",
    to: "/schools?school_type=secondary",
    bg: "bg-gradient-to-br from-purple-100 via-fuchsia-50 to-rose-100",
    emoji: "🏫"
  },
  {
    key: "composite",
    title: "Composite schools",
    description: "Years 1–13 in one school, including area schools.",
    to: "/schools?school_type=composite",
    bg: "bg-gradient-to-br from-emerald-100 via-lime-50 to-sky-100",
    emoji: "🌈"
  },
  {
    key: "university",
    title: "Universities",
    description: "NZ universities including the eight major universities.",
    to: "/universities?university_type=university",
    bg: "bg-gradient-to-br from-blue-100 via-slate-50 to-indigo-100",
    emoji: "🎓"
  },
  {
    key: "institute",
    title: "Institutes of technology",
    description: "Applied and vocational programmes at institutes of technology.",
    to: "/universities?university_type=institute_of_technology",
    bg: "bg-gradient-to-br from-teal-100 via-emerald-50 to-cyan-100",
    emoji: "🔧"
  },
  {
    key: "private_tertiary",
    title: "Private tertiary providers",
    description: "Specialised private training establishments and colleges.",
    to: "/universities?university_type=private",
    bg: "bg-gradient-to-br from-pink-100 via-rose-50 to-amber-100",
    emoji: "⭐"
  }
];

export function HomePage() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate(`/schools?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  return (
    <div className="space-y-8">
      <section className="mt-4 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex-1 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {t("discoverSchools")}
          </h1>
          <p className="text-sm text-slate-600 md:text-base">
            Compare kindergartens, primary and secondary schools, universities and
            institutes of technology. Explore regions, school zones and house prices.
          </p>
          <form onSubmit={handleSearch} className="mt-3 max-w-xl">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-600"
              >
                {t("search")}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {SCHOOL_TYPE_CARDS.map((card) => (
          <HomeCard
            key={card.key}
            title={card.title}
            description={card.description}
            to={card.to}
            bgClass={card.bg}
            emoji={card.emoji}
          />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-800">
          Quick start by island & city
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <h3 className="mb-2 text-xs font-semibold text-slate-800">
              North Island
            </h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_CITIES_BY_ISLAND.north.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() =>
                    navigate(`/schools?city=${encodeURIComponent(city)}`)
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <h3 className="mb-2 text-xs font-semibold text-slate-800">
              South Island
            </h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_CITIES_BY_ISLAND.south.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() =>
                    navigate(`/schools?city=${encodeURIComponent(city)}`)
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface HomeCardProps {
  title: string;
  description: string;
  to: string;
  bgClass: string;
  emoji: string;
}

function HomeCard({ title, description, to, bgClass, emoji }: HomeCardProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`group flex h-full flex-col justify-between rounded-2xl p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${bgClass}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-lg">
          {emoji}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-700">{description}</p>
    </button>
  );
}


