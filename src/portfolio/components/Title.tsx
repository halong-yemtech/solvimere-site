interface Props {
  /** Short label for a block inside a section ("Services", "Skills"…). */
  name: string;
  /** Controls on the right (e.g. filters). */
  actions?: React.ReactNode;
}

/** Small divider heading between blocks of a section: label, hairline, optional controls. */
export default function Title({ name, actions }: Props) {
  return (
    <header className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-3">
      <h2 className="pf-block-title">{name}</h2>
      <span className="h-px min-w-[4rem] flex-1 bg-white/[0.08]" aria-hidden />
      {actions}
    </header>
  );
}

/** Heading inside a card (e.g. "Experience"), with an icon tile. */
export function SubTitle({ title, Icon }: { title: string; Icon: React.ComponentType<{ "aria-hidden"?: boolean }> }) {
  return (
    <h3 className="pf-subheading">
      <span className="pf-icon-tile !w-11 !h-11 !rounded-xl !text-[1.7rem]">
        <Icon aria-hidden />
      </span>
      <span className="capitalize">{title}</span>
    </h3>
  );
}
