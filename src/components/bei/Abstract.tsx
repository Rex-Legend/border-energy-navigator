import { Reveal } from "./motion-primitives";

export function Abstract() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <Reveal>
        <article className="glass mx-auto max-w-[700px] rounded-3xl p-8 text-center sm:p-10">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Abstract</h2>
          <p className="mt-5 text-left text-sm leading-relaxed text-muted-foreground sm:text-base">
            The Border Energy Index is an analytical tool that models the feasibility of
            cross-border renewable electricity trade between countries by reducing a set of
            heterogeneous grid, market and geographic indicators into a single composite measure.
            For any ordered pair of countries, the platform combines the great-circle transmission
            distance and the resulting line losses, the retail electricity price differential
            between the exporting and importing markets, the exporting country&rsquo;s annual
            generation surplus or deficit, and the renewable share of that surplus into a normalised
            0&ndash;100 Border Energy Index score, which is presented alongside the underlying
            component metrics, live grid carbon intensity, scenario sensitivity controls and an
            estimate of the emissions avoided by the exchange. By expressing corridor viability in
            comparable terms across regions, the index is intended to support evidence-based,
            SDG7-aligned policy deliberation on where interconnection investment and cross-border
            energy trade agreements are most likely to deliver affordable, reliable and clean
            electricity.
          </p>
        </article>
      </Reveal>
    </section>
  );
}
