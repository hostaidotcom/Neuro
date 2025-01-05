import { IntegrationCard } from './integration-card';
import { ReactNode } from 'react';
import { INTEGRATIONS } from '../data/integrations';

interface IntegrationsGridProps {
    children?: ReactNode
}

export function IntegrationsGrid({ children }: IntegrationsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {INTEGRATIONS.map((item, index) => (
        <IntegrationCard
          key={item.label}
          item={item}
          index={index}
          onClick={() => {
            // TODO: Implement integration click handler
            console.log(`Clicked ${item.label}`);
          }}
        />
      ))}
        {children}
    </div>
  );
}

export interface IntegrationTheme {
  primary: string;
  secondary: string;
}

export interface Integration {
  icon: string;
  label: string;
  description?: string;
  theme: IntegrationTheme;
}