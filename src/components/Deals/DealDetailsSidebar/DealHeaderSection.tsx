
import React from 'react';
import { Deal } from '../types/deal';
import { formatCurrency } from '../utils/formatters';

interface DealHeaderSectionProps {
  deal: Deal;
}

export const DealHeaderSection: React.FC<DealHeaderSectionProps> = ({ deal }) => {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
      <div className="text-3xl font-semibold text-green-600">
        {formatCurrency(deal.value)}
      </div>
    </div>
  );
};
