import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchSchools } from "../api/schoolApi";
import { fetchKindergartens } from "../api/kindergartenApi";
import { fetchUniversities } from "../api/universityApi";
import type { School } from "../types";
import type { Kindergarten } from "../types";
import type { University } from "../types";
import { SchoolCard } from "../components/SchoolCard";
import { KindergartenCard } from "../components/KindergartenCard";
import { UniversityCard } from "../components/UniversityCard";

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
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [allKindergartens, setAllKindergartens] = useState<Kindergarten[]>([]);
  const [allUniversities, setAllUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all schools on component mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchSchools({ page_size: 12 }).catch(() => ({ items: [] })),
      fetchKindergartens({ page_size: 8 }).catch(() => ({ items: [] })),
      fetchUniversities({}).catch(() => [])
    ])
      .then(([schoolsData, kindergartensData, universitiesData]) => {
        setAllSchools(schoolsData.items || []);
        setAllKindergartens(kindergartensData.items || []);
        setAllUniversities(universitiesData || []);
      })
      .catch(() => {
        // Fail silently
      })
      .finally(() => setLoading(false));
  }, []);

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
            Compare Kindergartens, Primary And Secondary Schools, Universities And
            Institutes Of Technology. Explore Regions, School Zones And House Prices.
          </p>
          <form onSubmit={handleSearch} className="mt-3 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
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
              <button
                type="button"
                onClick={() => navigate("/map")}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                title={t("mapMode")}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <span className="hidden sm:inline">{t("mapMode")}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* All Schools Section */}
      {(allSchools.length > 0 || allKindergartens.length > 0 || allUniversities.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              All Schools Across New Zealand
            </h2>
            <button
              type="button"
              onClick={() => navigate("/schools")}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-600">Loading...</p>
          ) : (
            <div className="space-y-6">
              {/* Kindergartens */}
              {allKindergartens.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-slate-800">
                    Kindergartens ({allKindergartens.length})
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {allKindergartens.slice(0, 4).map((k) => (
                      <KindergartenCard key={k.id} kindergarten={k} />
                    ))}
                  </div>
                </div>
              )}

              {/* Schools */}
              {allSchools.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-slate-800">
                    Schools ({allSchools.length})
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {allSchools.slice(0, 8).map((s) => (
                      <SchoolCard key={s.id} school={s} />
                    ))}
                  </div>
                </div>
              )}

              {/* Universities */}
              {allUniversities.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-slate-800">
                    Universities ({allUniversities.length})
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {allUniversities.slice(0, 4).map((u) => (
                      <UniversityCard key={u.id} university={u} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/50 via-teal-700/50 to-cyan-700/50"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                {t("topSchoolsTitle")}
              </h2>
              <p className="text-sm text-emerald-50 md:text-base">
                {t("topSchoolsDescription")}
              </p>
              <button
                type="button"
                onClick={() => navigate("/schools?school_type=secondary")}
                className="mt-4 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-emerald-600 shadow-lg transition hover:bg-emerald-50 hover:shadow-xl"
              >
                {t("exploreTopSchools")}
              </button>
            </div>
            <div className="hidden md:block">
              <div className="flex gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <span className="text-3xl">🏆</span>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <span className="text-3xl">⭐</span>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <span className="text-3xl">🎓</span>
                </div>
              </div>
            </div>
          </div>
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
          Quick Start By Island & City
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


