import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "mi", name: "Te Reo Māori", flag: "🇳🇿" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLanguage = LANGUAGES.find((lang) => i18n.language.startsWith(lang.code)) || LANGUAGES[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="relative">
      <select
        value={currentLanguage.code}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg
          className="h-4 w-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}





