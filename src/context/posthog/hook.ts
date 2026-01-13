import {usePostHog as usePHHook} from 'posthog-js/react';
import {POSTHOG_API_KEY} from '../../configs';

export const usePostHog = () => {
  const posthog = usePHHook();
  if (!POSTHOG_API_KEY) {
    return null;
  }
  return posthog;
};

export const usePostHogEnabled = (): boolean => {
  return !!POSTHOG_API_KEY;
};
