import React, { useState } from 'react';
import { useGetParticipantGlobalHistory } from '@/services/customer-campaigns/hook';
import { TransactionHistoryTable } from './TransactionHistoryTable';

const filterCategories = [
  'All',
  'Earned',
  'Spent',
];

export function TransactionHistory() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeFilter, setActiveFilter] = useState('All');

  const { data, isLoading } = useGetParticipantGlobalHistory(page, limit);

  const transactions = data?.data || [];
  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const filteredTransactions = transactions.filter(record => {
    if (activeFilter === 'Earned') return record.type === 'EARN';
    if (activeFilter === 'Spent') return record.type === 'REDEEM';
    return true;
  });

  return (
    <TransactionHistoryTable
      transactions={filteredTransactions}
      isLoading={isLoading}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      filterCategories={filterCategories}
    />
  );
}
