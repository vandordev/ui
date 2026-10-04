import { CodeCollapsibleWrapper } from "@/components/code-collapsible-wrapper";
import { CopyButton } from "@/components/copy-button";
import { getIconForLanguageExtension } from "@/components/icons";
import { formatCode } from "@/lib/format-code";
import { highlightCode } from "@/lib/highlight-code";
import {
  getDemoSource,
  getRegistrySource,
  readOptionalFromRoot,
} from "@/lib/registry";
import { cn } from "@/lib/utils";

const ComponentCode = ({
  code,
  highlightedCode,
  language,
  title,
}: {
  code: string;
  highlightedCode: string;
  language: string;
  title: string | undefined;
}) => (
  <figure data-rehype-pretty-code-figure="" className="[&>pre]:max-h-96">
    {title ? (
      <figcaption
        className="text-code-foreground flex min-w-0 items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-70"
        data-language={language}
        data-rehype-pretty-code-title=""
      >
        {getIconForLanguageExtension(language)}
        <span className="truncate">{title}</span>
      </figcaption>
    ) : null}
    <CopyButton event="copy_primitive_code" value={code} />
    <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
  </figure>
);

export const ComponentSource = async ({
  name,
  src,
  title,
  collapsible = true,
  className,
  language,
  expandLabel,
  collapseLabel,
}: {
  name?: string;
  src?: string;
  title?: string;
  collapsible?: boolean;
  className?: string;
  language?: string;
  expandLabel?: string;
  collapseLabel?: string;
}) => {
  let code: string | null = null;

  if (name) {
    code = (await getDemoSource(name)) ?? (await getRegistrySource(name));
  }

  if (src) {
    code = await readOptionalFromRoot(src);
  }

  if (!code) {
    return null;
  }

  code = await formatCode(code);

  const lang = language ?? title?.split(".").pop() ?? "tsx";
  const highlightedCode = await highlightCode(code, lang);

  if (!collapsible) {
    return (
      <div className={cn("relative", className)}>
        <ComponentCode
          code={code}
          highlightedCode={highlightedCode}
          language={lang}
          title={title}
        />
      </div>
    );
  }

  return (
    <CodeCollapsibleWrapper
      className={className}
      navTriggerClassName={cn(!title && "top-3")}
      expandLabel={expandLabel}
      collapseLabel={collapseLabel}
    >
      <ComponentCode
        code={code}
        highlightedCode={highlightedCode}
        language={lang}
        title={title}
      />
    </CodeCollapsibleWrapper>
  );
};
