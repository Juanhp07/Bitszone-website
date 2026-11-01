import React from 'react';
import { MainApp } from './player/MainApp';
import { ErrorBoundary } from './ErrorBoundary';

export const PlayerApp = ({
  supabaseUrl,
  supabaseAnonKey,
  initialView = 'catalog',
}: {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  initialView?: string;
}) => {
  return (
    <ErrorBoundary>
      <MainApp supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} initialView={initialView} />
    </ErrorBoundary>
  );
};
