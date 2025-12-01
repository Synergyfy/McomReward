import React, { useState } from 'react';
import { useGetParticipantGlobalHistory } from '@/services/customer-campaigns/hook';
import { TransactionHistoryTable } from './TransactionHistoryTable';

export function TransactionHistory() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading } = useGetParticipantGlobalHistory(page, limit);

  const transactions = data?.data || [];
  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <TransactionHistoryTable
      transactions={transactions}
      isLoading={isLoading}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  );
}
