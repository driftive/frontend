import React from "react";

export interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * Simple wrapper for page content.
 * The main layout is now handled by AppLayout.
 */
export const PageContainer: React.FC<PageContainerProps> = ({children}) => {
  return <>{children}</>;
};
