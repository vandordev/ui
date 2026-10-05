import { WifiOffIcon } from "lucide-react";

import {
  ErrorState,
  ErrorStateContent,
  ErrorStateDescription,
  ErrorStateDetails,
  ErrorStateHeader,
  ErrorStateMedia,
  ErrorStateTitle,
} from "@/registry/new-york/error-state";

export const ErrorStateInlineDemo = () => (
  <ErrorState variant="inline" border="dashed">
    <ErrorStateMedia>
      <WifiOffIcon aria-hidden="true" />
    </ErrorStateMedia>
    <ErrorStateContent>
      <ErrorStateHeader>
        <ErrorStateTitle>Changes could not be synced</ErrorStateTitle>
        <ErrorStateDescription>
          Reconnect to sync your changes. Keep this tab open while you check
          your connection.
        </ErrorStateDescription>
      </ErrorStateHeader>
      <ErrorStateDetails summary="Support reference">
        Reference: DEMO-1042
      </ErrorStateDetails>
    </ErrorStateContent>
  </ErrorState>
);
