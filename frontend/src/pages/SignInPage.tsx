import { ArrowRight, ShieldCheck, Store, UserRoundCog, UsersRound, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

const portals = [
  {
    title: "Restaurant Manager",
    description: "Run daily restaurant operations, orders, payments, and bills.",
    href: "/manager/login",
    icon: UserRoundCog,
  },
  {
    title: "Restaurant Owner",
    description: "Manage your restaurant, menu, tables, orders, and team.",
    href: "/login",
    icon: Store,
  },
  {
    title: "Restaurant Staff",
    description: "View incoming orders and keep restaurant service moving.",
    href: "/staff/login",
    icon: UsersRound,
  },
  {
    title: "Platform Admin",
    description: "Manage restaurants and platform-level operations.",
    href: "/admin/login",
    icon: ShieldCheck,
  },
];

function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f5f1] px-4 py-12">
      <div className="w-full max-w-5xl">
        <header className="mb-10 text-center">
          <Link to="/" className="inline-flex flex-col items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#173b32] text-white">
              <UtensilsCrossed size={22} />
            </span>
            <span className="mt-3 font-serif text-3xl font-semibold text-slate-950">Aagan</span>
          </Link>
          <h1 className="mt-7 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Choose your sign-in
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
            Select the workspace for your role. You’ll then sign in with your email address and password.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {portals.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className="group flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <Icon size={22} />
              </span>
              <h2 className="mt-5 text-lg font-bold text-slate-950">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#173b32]">
                Continue to sign in
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link to="/" className="font-semibold text-[#173b32] hover:underline">
            Back to homepage
          </Link>
        </p>
      </div>
    </main>
  );
}

export default SignInPage;
