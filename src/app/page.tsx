import { ChatWidget } from "@/components/ChatWidget";

const services = [
  { name: "Routine Cleanings & Exams", blurb: "Every 6 months, full exam included." },
  { name: "Cosmetic Dentistry", blurb: "Whitening, veneers, and Invisalign." },
  { name: "Restorative Care", blurb: "Crowns, implants, and dentures." },
  { name: "Dental Emergencies", blurb: "Same-day emergency slots available." },
];

const hours = [
  ["Mon – Tue", "8:00 AM – 5:00 PM"],
  ["Wed", "8:00 AM – 7:00 PM"],
  ["Thu", "8:00 AM – 5:00 PM"],
  ["Fri", "8:00 AM – 2:00 PM"],
  ["Sat", "9:00 AM – 1:00 PM (select Saturdays)"],
  ["Sun", "Closed"],
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Riverside Dental Clinic
        </span>
        <nav className="hidden gap-6 text-sm text-foreground/70 sm:flex">
          <a href="#services" className="hover:text-accent">Services</a>
          <a href="#hours" className="hover:text-accent">Hours</a>
          <a href="#insurance" className="hover:text-accent">Insurance</a>
        </nav>
      </header>

      <section className="flex flex-col items-start gap-6 py-16 sm:py-24">
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          Now accepting new patients
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Friendly, modern dental care for your whole family.
        </h1>
        <p className="max-w-xl text-base text-foreground/70">
          Ask our assistant about services, pricing, insurance, or booking your
          first visit — right from this page.
        </p>
      </section>

      <section id="services" className="grid grid-cols-1 gap-4 py-12 sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.name}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <h3 className="font-medium text-foreground">{service.name}</h3>
            <p className="mt-1 text-sm text-foreground/70">{service.blurb}</p>
          </div>
        ))}
      </section>

      <section
        id="hours"
        className="grid grid-cols-1 gap-8 border-t border-border py-12 sm:grid-cols-2"
      >
        <div>
          <h2 className="mb-4 text-lg font-medium text-foreground">Hours</h2>
          <dl className="space-y-1 text-sm">
            {hours.map(([day, time]) => (
              <div key={day} className="flex justify-between gap-4 text-foreground/70">
                <dt>{day}</dt>
                <dd>{time}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div id="insurance">
          <h2 className="mb-4 text-lg font-medium text-foreground">Insurance</h2>
          <p className="text-sm text-foreground/70">
            In-network with Delta Dental, Cigna, MetLife, and Guardian PPO
            plans. No insurance? Ask the assistant about self-pay pricing.
          </p>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-xs text-foreground/50">
        123 Riverside Drive, Suite 200 · This is a portfolio demo for a
        fictional business.
      </footer>

      <ChatWidget />
    </main>
  );
}
