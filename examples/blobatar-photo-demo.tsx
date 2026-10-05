import { Blobatar } from "@/registry/new-york/blobatar";

const photo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#d9e4d5"/><circle cx="50" cy="38" r="18" fill="#596d51"/><path d="M15 100a35 35 0 0 1 70 0" fill="#596d51"/></svg>'
)}`;

export const BlobatarPhotoDemo = () => (
  <div className="flex flex-wrap items-center justify-center gap-6">
    <div className="flex items-center gap-3">
      <Blobatar name="alain" src={photo} size={48} />
      <span className="text-sm">Profile photo</span>
    </div>
    <div className="flex items-center gap-3">
      <Blobatar name="vandor" src="data:image/png;base64,invalid" size={48} />
      <span className="text-sm">Failed photo fallback</span>
    </div>
  </div>
);
