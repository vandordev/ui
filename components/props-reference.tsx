import type { PropDefinition } from "@/lib/playground";

export const PropsReference = ({
  definitions,
}: {
  definitions: Record<string, PropDefinition>;
}) => (
  <div className="mt-6 overflow-x-auto rounded-md border">
    <table className="w-full text-left text-sm">
      <caption className="sr-only">
        Component props, types, defaults, and descriptions
      </caption>
      <thead className="bg-muted/40">
        <tr className="border-b">
          <th className="px-4 py-3 font-medium" scope="col">
            Prop
          </th>
          <th className="px-4 py-3 font-medium" scope="col">
            Type / Description
          </th>
          <th className="px-4 py-3 font-medium" scope="col">
            Default
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(definitions).map(([name, definition]) => (
          <tr className="border-b align-top last:border-b-0" key={name}>
            <th className="px-4 py-4 font-mono text-xs font-medium" scope="row">
              {name}
            </th>
            <td className="min-w-48 px-4 py-4">
              <code className="font-mono text-xs break-words">
                {definition.type}
              </code>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {definition.description}
              </p>
            </td>
            <td className="px-4 py-4 font-mono text-xs">
              {definition.defaultValue}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
