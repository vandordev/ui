import { TextArea } from "@/registry/new-york/textarea";

export const TextAreaDemo = () => (
  <div className="grid max-w-sm gap-2">
    <TextArea
      label="Project summary"
      name="summary"
      rows={4}
      placeholder="Describe the work"
      aria-describedby="summary-hint"
    />
    <p id="summary-hint" className="text-sm text-muted-foreground">
      Keep this brief and specific.
    </p>
  </div>
);
