import React, {ReactNode, useMemo} from 'react';
import posthog from 'posthog-js';
import {PostHogProvider as PHProvider} from 'posthog-js/react';
import {POSTHOG_API_KEY, POSTHOG_API_HOST} from '../../configs';

type PostHogProviderProps = { children: ReactNode };

let initialized = false;

const getPostHogClient = (): typeof posthog | null => {
  if (!POSTHOG_API_KEY) {
    return null;
  }
  if (!initialized) {
    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_API_HOST,
      capture_pageview: true,
      capture_pageleave: true,
    });
    initialized = true;
  }
  return posthog;
};

export const MaybePostHog: React.FC<PostHogProviderProps> = ({children}) => {
  const client = useMemo(() => getPostHogClient(), []);

  if (!client) {
    return <>{children}</>;
  }

  return <PHProvider client={client}>{children}</PHProvider>;
};
