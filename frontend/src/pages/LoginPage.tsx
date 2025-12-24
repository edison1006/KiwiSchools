import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginTitle = i18n.isInitialized ? t("loginTitle") : "Sign in to your account";
  const loginSubtitle = i18n.isInitialized ? t("loginSubtitle") : "Welcome back! Please enter your details.";
  const emailLabel = i18n.isInitialized ? t("email") : "Email";
  const emailPlaceholder = i18n.isInitialized ? t("emailPlaceholder") : "you@example.com";
  const passwordLabel = i18n.isInitialized ? t("password") : "Password";
  const passwordPlaceholder = i18n.isInitialized ? t("passwordPlaceholder") : "Enter your password";
  const rememberMe = i18n.isInitialized ? t("rememberMe") : "Remember me";
  const forgotPassword = i18n.isInitialized ? t("forgotPassword") : "Forgot password?";
  const loginButton = i18n.isInitialized ? t("login") : "Sign in";
  const loggingIn = i18n.isInitialized ? t("loggingIn") : "Signing in...";
  const noAccount = i18n.isInitialized ? t("noAccount") : "Don't have an account?";
  const signUp = i18n.isInitialized ? t("signUp") : "Sign up";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement login logic
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{loginTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">{loginSubtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              {emailLabel}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={emailPlaceholder}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              {passwordLabel}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={passwordPlaceholder}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                {rememberMe}
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                {forgotPassword}
              </a>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? loggingIn : loginButton}
          </button>
        </form>
        <div className="text-center text-sm text-slate-600">
          {noAccount}{" "}
          <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-500">
            {signUp}
          </Link>
        </div>
      </div>
    </div>
  );
}









