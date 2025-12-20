import { Link, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HomePage } from "./pages/HomePage";
import { KindergartenListPage } from "./pages/KindergartenListPage";
import { KindergartenDetailPage } from "./pages/KindergartenDetailPage";
import { SchoolListPage } from "./pages/SchoolListPage";
import { SchoolDetailPage } from "./pages/SchoolDetailPage";
import { UniversityListPage } from "./pages/UniversityListPage";
import { UniversityDetailPage } from "./pages/UniversityDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { MapPage } from "./pages/MapPage";
import { LanguageSelector } from "./components/LanguageSelector";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  const { t, i18n } = useTranslation();
  
  // Fallback if translation fails
  const appName = i18n.isInitialized ? t("appName") : "KiwiSchools";
  const signInText = i18n.isInitialized ? t("signIn") : "Sign in";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white font-semibold shadow-sm">
              K
            </span>
            <span className="text-lg font-semibold text-slate-900">
              {appName}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-xs font-medium text-slate-600 hover:text-slate-800 md:inline-flex"
            >
              {signInText}
            </Link>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 shadow-sm"
            >
              A
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/kindergartens" element={<KindergartenListPage />} />
              <Route
                path="/kindergartens/:id"
                element={<KindergartenDetailPage />}
              />
              <Route path="/schools" element={<SchoolListPage />} />
              <Route path="/schools/:id" element={<SchoolDetailPage />} />
              <Route path="/universities" element={<UniversityListPage />} />
              <Route path="/universities/:id" element={<UniversityDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/map" element={<MapPage />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} KiwiSchools</span>
          <a
            href="https://www.education.govt.nz/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-700"
          >
            NZ Ministry of Education
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
