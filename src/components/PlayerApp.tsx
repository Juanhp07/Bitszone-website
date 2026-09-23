import React from 'react';
import { MainApp } from './player/MainApp';

export const PlayerApp = ({ supabaseUrl, supabaseAnonKey }: { supabaseUrl?: string, supabaseAnonKey?: string }) => {
  return <MainApp supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />;
};
