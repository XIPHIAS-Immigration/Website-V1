import type { ComponentPropsWithoutRef } from "react";

export default function ResponsiveTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
      <table {...props} className={`m-0 min-w-full ${props.className || ""}`} />
    </div>
  );
}
