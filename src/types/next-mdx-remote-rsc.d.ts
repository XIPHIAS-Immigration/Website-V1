declare module "next-mdx-remote/rsc" {
  import type { ReactNode } from "react";

  // Minimal, future-proof typings to keep your generics working.
  export function compileMDX<TFrontmatter = Record<string, unknown>>(opts: {
    source: string;
    options?: {
      parseFrontmatter?: boolean;
      mdxOptions?: any; // keep loose; avoids pulling extra type deps
      components?: Record<string, any>;
    };
  }): Promise<{
    content: ReactNode;
    frontmatter: TFrontmatter;
  }>;

  // Optional: async RSC component type, kept loose on purpose
  export const MDXRemote: (props: {
    source: string;
    components?: Record<string, any>;
  }) => Promise<JSX.Element>;
}
