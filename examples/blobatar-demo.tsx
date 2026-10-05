import { Blobatar } from "@/registry/new-york/blobatar";

export const BlobatarDemo = () => (
  <div className="flex flex-wrap items-center justify-center gap-3">
    {["alain", "vandor", "luna", "mars"].map((name) => (
      <Blobatar key={name} name={name} alt={name} size={48} />
    ))}
  </div>
);
