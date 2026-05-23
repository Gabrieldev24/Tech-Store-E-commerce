'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CompanyContextType {
  companyName: string;
  setCompanyName: (name: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companyName, setCompanyNameState] = useState('TechStore');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load company name from localStorage
    const stored = localStorage.getItem('companyName');
    if (stored) {
      setCompanyNameState(stored);
    }
    setIsLoaded(true);
  }, []);

  const setCompanyName = (name: string) => {
    setCompanyNameState(name);
    localStorage.setItem('companyName', name);
  };

  return (
    <CompanyContext.Provider value={{ companyName, setCompanyName }}>
      {isLoaded && children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
}
