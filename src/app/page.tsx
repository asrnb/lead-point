import Image from "next/image";
import { ChatWidget } from "@/components/ChatWidget";
import { FadeIn } from "@/components/FadeIn";

const services = [
  {
    name: "Routine Cleanings & Exams",
    blurb: "Every 6 months, full exam included.",
    icon: "🦷",
  },
  {
    name: "Cosmetic Dentistry",
    blurb: "Whitening, veneers, and Invisalign.",
    icon: "✨",
  },
  {
    name: "Restorative Care",
    blurb: "Crowns, implants, and dentures.",
    icon: "🔧",
  },
  {
    name: "Dental Emergencies",
    blurb: "Same-day emergency slots available.",
    icon: "🚑",
  },
];

const whyUs = [
  { title: "Same-day emergency care", blurb: "Severe pain or a broken tooth? We hold slots open every day we're open." },
  { title: "In-network with major plans", blurb: "Delta Dental, Cigna, MetLife, and Guardian PPO — we verify your benefits before you arrive." },
  { title: "Nitrous oxide for anxious patients", blurb: "Nervous about the dentist? Let us know when you book and we'll make it easy." },
  { title: "Same-day crowns", blurb: "In-office milling means most crowns are done in one visit, not two." },
];

const team = [
  {
    name: "Dr. Amara Okafor, DDS",
    role: "Lead Dentist & Owner",
    blurb: "14 years in general and cosmetic dentistry, with a focus on same-day crowns and Invisalign.",
    photo: "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Dr. Priya Nair, DDS",
    role: "Associate Dentist",
    blurb: "6 years of experience, with a calm chairside manner that anxious patients especially appreciate.",
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Jordan Ellis, RDH",
    role: "Lead Dental Hygienist",
    blurb: "Handles most routine cleanings and patient education on at-home care.",
    photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&q=80",
  },
];

const testimonials = [
  {
    quote: "I used to dread the dentist. Dr. Nair and the team here actually made it easy — no judgment, just care.",
    name: "R. Delgado",
    stars: 5,
  },
  {
    quote: "Got a same-day crown done in one visit before a trip. Didn't think that was even possible.",
    name: "M. Alvarez",
    stars: 5,
  },
  {
    quote: "Front desk verified my insurance before I even showed up, so there were no surprises on the bill.",
    name: "K. Tan",
    stars: 5,
  },
];

const hours = [
  ["Mon – Tue", "8:00 AM – 5:00 PM"],
  ["Wed", "8:00 AM – 7:00 PM"],
  ["Thu", "8:00 AM – 5:00 PM"],
  ["Fri", "8:00 AM – 2:00 PM"],
  ["Sat", "9:00 AM – 1:00 PM (select Saturdays)"],
  ["Sun", "Closed"],
];

const stats = [
  { value: "15+", label: "Years in Riverside" },
  { value: "12,000+", label: "Patients treated" },
  { value: "4.9★", label: "Average rating" },
  { value: "4", label: "Insurance plans in-network" },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="text-accent" aria-label={`${count} out of 5 stars`}>
      {"★".repeat(count)}
      <span className="text-border">{"★".repeat(5 - count)}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Riverside Dental Clinic
          </span>
          <nav className="hidden gap-6 text-sm text-foreground/70 sm:flex">
            <a href="#services" className="transition-colors hover:text-accent">Services</a>
            <a href="#team" className="transition-colors hover:text-accent">Our Team</a>
            <a href="#hours" className="transition-colors hover:text-accent">Hours</a>
            <a href="#insurance" className="transition-colors hover:text-accent">Insurance</a>
          </nav>
          <a
            href="tel:+15551234567"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            (555) 123-4567
          </a>
        </div>
      </header>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 sm:py-24 md:grid-cols-2">
          <FadeIn className="flex flex-col items-start gap-6">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Now accepting new patients
            </span>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Friendly, modern dental care for your whole family.
            </h1>
            <p className="max-w-lg text-base text-foreground/70">
              Ask our assistant about services, pricing, or insurance, or book
              your first visit — right from this page, no phone tag required.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#services"
                className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Explore services
              </a>
              <a
                href="tel:+15551234567"
                className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                Call (555) 123-4567
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={150} className="relative aspect-4/3 w-full overflow-hidden rounded-3xl shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80"
              alt="Riverside Dental Clinic treatment room"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 75} className="text-center">
              <div className="text-2xl font-semibold text-foreground sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-foreground/60 sm:text-sm">{stat.label}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="services" className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
        <FadeIn>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-accent">
            Services
          </h2>
          <p className="mb-10 max-w-xl text-2xl font-semibold tracking-tight text-foreground">
            Everything your smile needs, under one roof.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((service, i) => (
            <FadeIn key={service.name} delay={i * 75}>
              <div className="h-full rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <span className="text-2xl">{service.icon}</span>
                <h3 className="mt-3 font-medium text-foreground">{service.name}</h3>
                <p className="mt-1 text-sm text-foreground/70">{service.blurb}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
          <FadeIn>
            <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-accent">
              Why patients choose us
            </h2>
            <p className="mb-10 max-w-xl text-2xl font-semibold tracking-tight text-foreground">
              Care that fits into a real life, not the other way around.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {whyUs.map((item, i) => (
              <FadeIn key={item.title} delay={i * 75} className="flex gap-4">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <div>
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{item.blurb}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
        <FadeIn>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-accent">
            Our Team
          </h2>
          <p className="mb-10 max-w-xl text-2xl font-semibold tracking-tight text-foreground">
            Meet the people behind your care.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {team.map((member, i) => (
            <FadeIn key={member.name} delay={i * 100} className="text-center">
              <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full shadow-md transition-transform duration-300 hover:scale-105">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <h3 className="mt-4 font-medium text-foreground">{member.name}</h3>
              <p className="text-sm text-accent">{member.role}</p>
              <p className="mt-2 text-sm text-foreground/70">{member.blurb}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
          <FadeIn>
            <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-accent">
              Patient Stories
            </h2>
            <p className="mb-10 max-w-xl text-2xl font-semibold tracking-tight text-foreground">
              What it's like to be a patient here.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="h-full rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <Stars count={t.stars} />
                  <p className="mt-3 text-sm text-foreground/80">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-3 text-sm font-medium text-foreground/60">{t.name}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section
        id="hours"
        className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-16 sm:py-20 sm:grid-cols-2"
      >
        <FadeIn>
          <h2 className="mb-4 text-lg font-medium text-foreground">Hours</h2>
          <dl className="space-y-1 text-sm">
            {hours.map(([day, time]) => (
              <div key={day} className="flex justify-between gap-4 text-foreground/70">
                <dt>{day}</dt>
                <dd>{time}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>
        <FadeIn delay={100} id="insurance">
          <h2 className="mb-4 text-lg font-medium text-foreground">Insurance</h2>
          <p className="text-sm text-foreground/70">
            In-network with Delta Dental, Cigna, MetLife, and Guardian PPO
            plans. No insurance? Ask the assistant about self-pay pricing.
          </p>
        </FadeIn>
      </section>

      <section className="bg-accent">
        <FadeIn className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xl font-semibold text-accent-foreground sm:text-2xl">
            Ready to get that smile looked at?
          </p>
          <a
            href="tel:+15551234567"
            className="rounded-full bg-accent-foreground px-5 py-3 text-sm font-medium text-accent transition-opacity hover:opacity-90"
          >
            Call (555) 123-4567
          </a>
        </FadeIn>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-xs text-foreground/50">
        123 Riverside Drive, Suite 200 · This is a portfolio demo for a
        fictional business.
      </footer>

      <ChatWidget />
    </main>
  );
}
