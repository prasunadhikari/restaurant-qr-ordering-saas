import {
  ArrowDown,
  ArrowRight,
  Building2,
  ChevronRight,
  Clock3,
  ShieldCheck,
  Store,
  Users,
  UserRoundCog,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const elements = page.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={pageRef}
      className="home-page min-h-screen bg-[#F5F1E8] text-[#191815]"
    >
      {/* Navigation */}
      <header className="home-nav absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
          <Link to="/" className="group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-white/40 bg-[#191815] text-white">
                <span className="text-lg font-serif">A</span>
              </div>

              <div>
                <p className="font-serif text-xl tracking-[0.08em] text-white">
                  AAGAN
                </p>
                <p className="mt-0.5 text-[8px] uppercase tracking-[0.3em] text-white/60">
                  Restaurant platform
                </p>
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            <a
              href="#about"
              className="text-xs uppercase tracking-[0.18em] text-white/75 transition hover:text-white"
            >
              About
            </a>

            <a
              href="#experience"
              className="text-xs uppercase tracking-[0.18em] text-white/75 transition hover:text-white"
            >
              Experience
            </a>

            <a
              href="#access"
              className="text-xs uppercase tracking-[0.18em] text-white/75 transition hover:text-white"
            >
              Access
            </a>
          </nav>

          <Link
            to="/signin"
            className="border border-white/30 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-[#191815]"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="home-hero relative min-h-screen overflow-hidden bg-[#191815]">
          {/* Hero image */}
          <div
            className="home-hero-image absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=2200&q=90')",
            }}
          />

          {/* Image treatment */}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35" />

          {/* Content */}
          <div className="home-hero-content relative mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-16 pt-32 lg:px-10 lg:pb-20">
            <div className="max-w-5xl">
              <p className="mb-7 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D7BD8C]">
                <span className="h-px w-10 bg-[#D7BD8C]" />
                Restaurant technology, thoughtfully made
              </p>

              <h1 className="max-w-4xl font-serif text-6xl leading-[0.9] tracking-[-0.035em] text-white sm:text-7xl lg:text-[110px]">
                Where every
                <span className="block italic text-[#E5D4B1]">
                  table welcomes you.
                </span>
              </h1>

              <div className="mt-10 flex max-w-2xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-lg text-sm leading-7 text-white/70 sm:text-base">
                  Aagan brings the essential parts of restaurant operations
                  together — creating a simpler experience for restaurants,
                  teams, and the people they serve.
                </p>

                <a
                  href="#about"
                  className="group flex shrink-0 items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Discover Aagan
                  <span className="flex h-10 w-10 items-center justify-center border border-white/30 transition group-hover:bg-white group-hover:text-[#191815]">
                    <ArrowDown className="h-4 w-4" />
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Hero bottom detail */}
          <div className="absolute bottom-0 right-0 hidden border-l border-t border-white/20 px-8 py-5 lg:block">
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/40">
              Kathmandu · Nepal
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section
          id="about"
          className="px-6 py-28 lg:px-10 lg:py-40"
        >
          <div
            data-reveal
            className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-28"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9A6248]">
                The idea
              </p>

              <div className="mt-8 h-px w-16 bg-[#A88752]" />
            </div>

            <div>
              <h2 className="max-w-4xl font-serif text-4xl leading-[1.08] tracking-[-0.025em] text-[#191815] sm:text-5xl lg:text-6xl">
                A restaurant is more than a place to eat.
                <span className="mt-2 block text-[#7C786E]">
                  It is a place where people come together.
                </span>
              </h2>

              <p className="mt-9 max-w-2xl text-base leading-8 text-[#6D6A61]">
                Aagan is built around that simple idea. We create digital
                tools that help restaurants run their everyday operations
                with less friction, while keeping the experience personal,
                clear, and human.
              </p>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[#6D6A61]">
                From the people managing the restaurant to the teams serving
                guests, everyone gets a place designed around what they
                actually need.
              </p>
            </div>
          </div>
        </section>

        {/* Image / statement */}
        <section
          id="experience"
          className="relative min-h-[680px] overflow-hidden"
        >
          <div
            className="home-statement-image absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=2200&q=90')",
            }}
          />

          <div className="absolute inset-0 bg-black/45" />

          <div className="relative flex min-h-[680px] items-end px-6 py-16 lg:px-10 lg:py-20">
            <div className="mx-auto w-full max-w-7xl">
              <div className="max-w-3xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D7BD8C]">
                  Designed for the people behind the table
                </p>

                <h2 className="mt-6 font-serif text-5xl leading-[0.95] tracking-[-0.025em] text-white sm:text-6xl lg:text-8xl">
                  Simple technology.
                  <span className="block italic text-[#E5D4B1]">
                    Thoughtful hospitality.
                  </span>
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Product pillars */}
        <section className="bg-[#191815] px-6 py-28 text-white lg:px-10 lg:py-36">
          <div data-reveal className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D7BD8C]">
                  The platform
                </p>

                <h2 className="mt-6 max-w-sm font-serif text-4xl leading-tight sm:text-5xl">
                  Everything your restaurant needs.
                </h2>
              </div>

              <div className="divide-y divide-white/10 border-y border-white/10">
                <PlatformItem
                  number="01"
                  icon={<Store className="h-5 w-5" />}
                  title="Restaurant"
                  description="A central place for your restaurant information, settings, tables, menu, and daily operations."
                />

                <PlatformItem
                  number="02"
                  icon={<Users className="h-5 w-5" />}
                  title="People"
                  description="Give owners and staff focused access to the tools and information relevant to their role."
                />

                <PlatformItem
                  number="03"
                  icon={<Clock3 className="h-5 w-5" />}
                  title="Operations"
                  description="Keep orders and restaurant activity moving through a clear, connected workflow."
                />

                <PlatformItem
                  number="04"
                  icon={<Building2 className="h-5 w-5" />}
                  title="Management"
                  description="Bring multiple restaurants, users, and operational information into one platform."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Editorial split section */}
        <section className="bg-[#E8E1D5] px-6 py-20 lg:px-10 lg:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div data-reveal className="home-editorial-image overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=90"
                alt="Restaurant dining space"
                className="h-[520px] w-full object-cover grayscale-[15%] transition duration-700 hover:scale-[1.02]"
              />
            </div>

            <div data-reveal className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9A6248]">
                Built around service
              </p>

              <h2 className="mt-6 font-serif text-4xl leading-tight text-[#191815] sm:text-5xl">
                Technology should disappear into the experience.
              </h2>

              <p className="mt-7 text-base leading-8 text-[#6D6A61]">
                The best restaurant technology does not ask your team to
                become technology experts. It should simply make the work
                clearer.
              </p>

              <p className="mt-5 text-base leading-8 text-[#6D6A61]">
                Aagan is designed to stay out of the way while giving your
                team the information and control they need.
              </p>

              <a
                href="#access"
                className="group mt-9 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#191815]"
              >
                Enter the platform

                <span className="flex h-9 w-9 items-center justify-center border border-[#191815]/30 transition group-hover:bg-[#191815] group-hover:text-white">
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="bg-[#F5F1E8] px-6 py-28 lg:px-10 lg:py-36">
          <div data-reveal className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9A6248]">
                How Aagan works
              </p>

              <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
                One connected rhythm.
              </h2>
            </div>

            <div className="mt-20 grid gap-0 border-t border-[#191815]/15 md:grid-cols-3">
              <Step
                number="01"
                title="Set up"
                description="Create your restaurant, configure your tables, menu, team, and operating preferences."
              />

              <Step
                number="02"
                title="Run"
                description="Your team works from focused spaces designed around their everyday responsibilities."
              />

              <Step
                number="03"
                title="Grow"
                description="Understand what is happening across your restaurant and build better operations over time."
              />
            </div>
          </div>
        </section>

        {/* Access */}
        <section
          id="access"
          className="bg-[#DED5C7] px-6 py-28 lg:px-10 lg:py-36"
        >
          <div data-reveal className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9A6248]">
                Aagan access
              </p>

              <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Everyone has their place.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#6D6A61]">
                Different responsibilities deserve different workspaces.
                Choose where you belong.
              </p>
            </div>

            <div className="mt-16 grid gap-px bg-[#191815]/15 md:grid-cols-2 xl:grid-cols-4">
              <AccessCard
                icon={<ShieldCheck className="h-5 w-5" />}
                eyebrow="Platform"
                title="Admin"
                description="Manage restaurants, users, platform operations, and system-level settings."
                href="/admin/login"
              />

              <AccessCard
                icon={<Store className="h-5 w-5" />}
                eyebrow="Restaurant"
                title="Owner"
                description="Manage your restaurant, team, tables, menu, orders, and business settings."
                href="/login"
              />

              <AccessCard
                icon={<UserRoundCog className="h-5 w-5" />}
                eyebrow="Restaurant"
                title="Manager"
                description="Coordinate daily orders, customer payments, tables, and bills."
                href="/manager/login"
              />

              <AccessCard
                icon={<Users className="h-5 w-5" />}
                eyebrow="Restaurant"
                title="Staff"
                description="Access your daily workspace and focus on the operations that matter to you."
                href="/staff/login"
              />
            </div>
          </div>
        </section>

        {/* Final statement */}
        <section className="relative overflow-hidden bg-[#191815] px-6 py-32 lg:px-10 lg:py-44">
          <div data-reveal className="mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-9 flex h-14 w-14 items-center justify-center border border-[#A88752]/50 text-[#D7BD8C]">
              <span className="font-serif text-2xl">A</span>
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#A88752]">
              Aagan
            </p>

            <h2 className="mt-7 font-serif text-5xl leading-[0.95] tracking-[-0.03em] text-white sm:text-6xl lg:text-8xl">
              Where every table
              <span className="block italic text-[#E5D4B1]">
                welcomes you.
              </span>
            </h2>

            <p className="mx-auto mt-8 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
              A modern restaurant platform, created in Nepal for the
              restaurants shaping the way people experience hospitality.
            </p>

            <Link
              to="/signin"
              className="home-final-link mt-10 inline-flex items-center gap-3 border border-white/25 px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#191815]"
            >
              Enter Aagan
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#11110F] px-6 py-10 text-white lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center border border-[#D7BD8C]/40 bg-white/5 font-serif text-lg text-[#E5D4B1]">
                A
              </div>

              <div>
                <p className="font-serif text-base tracking-[0.22em] text-white">
                  AAGAN
                </p>
                <p className="mt-1 text-[8px] uppercase tracking-[0.24em] text-white/45">
                  Where every table welcomes you.
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-5 text-[9px] font-medium uppercase tracking-[0.24em] text-white/60">
              <a href="#about" className="transition hover:text-white">
                About
              </a>
              <a href="#experience" className="transition hover:text-white">
                Experience
              </a>
              <a href="#access" className="transition hover:text-white">
                Access
              </a>
              <Link to="/signin" className="transition hover:text-white">
                Sign in
              </Link>
            </nav>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-[10px] uppercase tracking-[0.2em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Prasun Adhikari. All rights reserved.</p>
            <p>Restaurant technology · Kathmandu · Nepal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface PlatformItemProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function PlatformItem({
  number,
  icon,
  title,
  description,
}: PlatformItemProps) {
  return (
    <div
      data-reveal
      className="home-platform-item group grid gap-6 py-9 sm:grid-cols-[70px_50px_0.7fr_1fr] sm:items-start"
    >
      <span className="text-[10px] tracking-[0.2em] text-white/30">
        {number}
      </span>

      <div className="flex h-10 w-10 items-center justify-center border border-white/10 text-[#D7BD8C] transition group-hover:border-[#A88752]/60">
        {icon}
      </div>

      <h3 className="font-serif text-2xl text-white">
        {title}
      </h3>

      <p className="max-w-md text-sm leading-7 text-white/45">
        {description}
      </p>
    </div>
  );
}

interface StepProps {
  number: string;
  title: string;
  description: string;
}

function Step({
  number,
  title,
  description,
}: StepProps) {
  return (
    <div
      data-reveal
      className="home-step border-b border-[#191815]/15 px-0 py-10 md:border-b-0 md:border-r md:px-8 md:py-10 first:pl-0 last:border-r-0 last:pr-0"
    >
      <span className="text-[10px] font-semibold tracking-[0.2em] text-[#A88752]">
        {number}
      </span>

      <h3 className="mt-7 font-serif text-3xl text-[#191815]">
        {title}
      </h3>

      <p className="mt-4 max-w-sm text-sm leading-7 text-[#6D6A61]">
        {description}
      </p>
    </div>
  );
}

interface AccessCardProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}

function AccessCard({
  icon,
  eyebrow,
  title,
  description,
  href,
}: AccessCardProps) {
  return (
    <Link
      to={href}
      data-reveal
      className="home-access-card group bg-[#F5F1E8] p-8 transition duration-500 hover:bg-[#191815] hover:text-white sm:p-10 lg:p-12"
    >
      <div className="flex h-11 w-11 items-center justify-center border border-[#191815]/15 text-[#9A6248] transition group-hover:border-white/20 group-hover:text-[#D7BD8C]">
        {icon}
      </div>

      <p className="mt-8 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9A6248] group-hover:text-[#D7BD8C]">
        {eyebrow}
      </p>

      <h3 className="mt-2 font-serif text-3xl">
        {title}
      </h3>

      <p className="mt-5 min-h-[84px] text-sm leading-7 text-[#6D6A61] transition group-hover:text-white/50">
        {description}
      </p>

      <div className="mt-8 flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.2em]">
        Enter workspace
        <span className="flex h-8 w-8 items-center justify-center border border-[#191815]/20 transition group-hover:border-white/20">
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default HomePage;