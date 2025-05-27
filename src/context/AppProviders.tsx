"use client";

import type React from 'react';
import { AuthProvider } from './AuthContext';
import { FamilyDataProvider } from './FamilyDataContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <FamilyDataProvider>
        {children}
      </FamilyDataProvider>
    </AuthProvider>
  );
};
