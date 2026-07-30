import {useParams} from "react-router";

// Slug the API returns for GitHub (see providerToSlug in the API's drift_stream handler).
export const DEFAULT_PROVIDER = "gh";

// useProvider reads the :provider route segment, falling back to the default for routes that
// don't carry one.
export function useProvider(): string {
  const {provider} = useParams();
  return provider || DEFAULT_PROVIDER;
}
