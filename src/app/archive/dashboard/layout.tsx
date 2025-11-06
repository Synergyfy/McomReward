import { ReactNode } from 'react';

interface BusinessLayoutProps {
  children: ReactNode;
}

const BusinessLayout = ({ children }: BusinessLayoutProps) => {
  return <>{children}</>;
};

export default BusinessLayout;
