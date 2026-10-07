const { readFileSync, writeFileSync } = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const resolveAliasDirectory = (cwd, alias) => {
  const configPath = ts.findConfigFile(cwd, ts.sys.fileExists, "tsconfig.json");
  if (!configPath) {
    throw new Error("Consumer tsconfig.json is required");
  }
  const loaded = ts.readConfigFile(configPath, ts.sys.readFile);
  if (loaded.error) {
    throw new Error("Consumer tsconfig.json could not be read");
  }
  const parsed = ts.parseJsonConfigFileContent(
    loaded.config,
    ts.sys,
    path.dirname(configPath)
  );
  const matches = Object.entries(parsed.options.paths ?? {})
    .map(([key, values]) => {
      const star = key.indexOf("*");
      if (star === -1) {
        return key === alias ? { key, suffix: "", values } : null;
      }
      const prefix = key.slice(0, star);
      const ending = key.slice(star + 1);
      return alias.startsWith(prefix) && alias.endsWith(ending)
        ? {
            key,
            suffix: alias.slice(prefix.length, alias.length - ending.length),
            values,
          }
        : null;
    })
    .filter(Boolean)
    .sort(
      (a, b) => b.key.replace("*", "").length - a.key.replace("*", "").length
    );
  const exact = matches.find((match) => !match.key.includes("*"));
  const match = exact ?? matches[0];
  if (!match || match.values.length !== 1) {
    throw new Error(`Alias ${alias} needs one unambiguous TypeScript path`);
  }
  const base =
    parsed.options.baseUrl ??
    parsed.options.pathsBasePath ??
    path.dirname(configPath);
  const directory = path.resolve(
    base,
    match.values[0].replace("*", match.suffix)
  );
  const relative = path.relative(cwd, directory);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Alias ${alias} resolves outside the consumer`);
  }
  return relative.split(path.sep).join("/");
};

// Prepare local closure without copying deployed artifacts or changing source files.
// Caller owns outputDirectory and invokes stock CLI on the returned root artifact.
const prepareFamilyArtifacts = ({
  artifactDirectory,
  cwd,
  name,
  outputDirectory,
}) => {
  const config = JSON.parse(
    readFileSync(path.join(cwd, "components.json"), "utf-8")
  );
  const components = resolveAliasDirectory(cwd, config.aliases.components);
  const ui = resolveAliasDirectory(
    cwd,
    config.aliases.ui ?? `${config.aliases.components}/ui`
  );
  const prepared = new Map();
  const visiting = new Set();
  const visit = (itemName) => {
    if (visiting.has(itemName)) {
      throw new Error(`Registry dependency cycle at ${itemName}`);
    }
    if (prepared.has(itemName)) {
      return prepared.get(itemName);
    }
    if (!/^[a-z0-9-]+$/.test(itemName)) {
      throw new Error("Invalid local registry item name");
    }
    visiting.add(itemName);
    const artifact = JSON.parse(
      readFileSync(path.join(artifactDirectory, `${itemName}.json`), "utf-8")
    );
    // The CLI combines dependency strings literally. Avoid duplicate unversioned
    // and versioned foundation packages in a closure (pnpm can mis-pair specs).
    const foundationVersions = {
      cn: "cn@^0.4.0",
      motion: "motion@^12.38.0",
      "lucide-react": "lucide-react@1.11.0",
    };
    artifact.dependencies = artifact.dependencies?.map(
      (dependency) => foundationVersions[dependency] ?? dependency
    );
    artifact.registryDependencies = (artifact.registryDependencies ?? []).map(
      (dependency) => {
        const local = dependency.match(
          /^https:\/\/vandor-ui\.vercel\.app\/r\/([a-z0-9-]+)\.json$/
        );
        if (local) {
          return visit(local[1]);
        }
        if (/^https?:/.test(dependency)) {
          throw new Error(
            `External registry dependency requires review: ${dependency}`
          );
        }
        return visit(dependency);
      }
    );
    for (const file of artifact.files ?? []) {
      if (file.target?.startsWith("components/ui/")) {
        file.target = `~/${ui}/${file.target.slice("components/ui/".length)}`;
      } else if (file.target?.startsWith("components/loading-ui/")) {
        file.target = `~/${components}/loading-ui/${file.target.slice("components/loading-ui/".length)}`;
      }
      if (itemName === "loading") {
        file.content = file.content?.replaceAll(
          "@/components/loading-ui/",
          "@/registry/new-york/components/loading-ui/"
        );
      }
      const family =
        file.path.match(/\/components\/(autocomplete|data-grid)\/(.+)$/) ??
        file.target?.match(/^components\/(autocomplete|data-grid)\/(.+)$/);
      if (family) {
        if (family[2].split("/").includes("..")) {
          throw new Error("Invalid family source path");
        }
        // ~/ explicitly makes this cwd-relative, preventing CLI src double-prefix.
        file.target = `~/${components}/${family[1]}/${family[2]}`;
        // Repository source stays flat. Only cross-family primitive imports move;
        // stock CLI then rewrites this documented registry UI import namespace.
        file.content = file.content?.replace(
          /(["'])\.\/([^"']+)\1/g,
          (whole, quote, module) => {
            const owned =
              family[1] === "autocomplete"
                ? /^(autocomplete|use-autocomplete)([.-]|$)/.test(module)
                : /^(data-grid|use-data-grid)([.-]|$)/.test(module);
            return owned
              ? whole
              : `${quote}@/registry/new-york/ui/${module}${quote}`;
          }
        );
      }
    }
    const destination = path.join(outputDirectory, `${itemName}.json`);
    writeFileSync(destination, JSON.stringify(artifact));
    visiting.delete(itemName);
    prepared.set(itemName, destination);
    return destination;
  };
  return visit(name);
};

module.exports = { prepareFamilyArtifacts, resolveAliasDirectory };
