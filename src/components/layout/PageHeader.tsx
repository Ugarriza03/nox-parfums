import { Reveal } from "@/components/ui";

export function PageHeader({
  eyebrow,
  title,
  lead
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <section className="border-b border-edge/50 pt-28 md:pt-36">
      <div className="nox-shell pb-10 md:pb-14">
        <Reveal>
          <p className="nox-eyebrow">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-[34px] leading-[1.07] text-bone md:text-[54px]">
            {title}
          </h1>
          {lead && (
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mist">{lead}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
