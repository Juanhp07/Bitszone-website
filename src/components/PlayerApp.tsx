import React from 'react';
import { MainApp } from './player/MainApp';
import { ErrorBoundary } from './ErrorBoundary';

export const PlayerApp = ({ supabaseUrl, supabaseAnonKey }: { supabaseUrl?: string, supabaseAnonKey?: string }) => {
  return (
    <ErrorBoundary>
      <MainApp supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
    </ErrorBoundary>
  );
};
