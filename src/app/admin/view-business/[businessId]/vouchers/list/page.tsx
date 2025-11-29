"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  QrCode,
  Gift,
  Percent,
  Ticket,
  Wallet,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useParams } from 'next/navigation'; // Import useParams
import { useGetVouchers } from '@/services/vouchers/hook'; // Import the new hook
import { Paginated, Voucher } from '@/services/vouchers/types'; // Import Voucher type

export default function VouchersPage() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Redeemed' | 'Expired' | 'Revoked'>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const params = useParams();
  const businessId = params.businessId as string;

  const defaultPaginated: Paginated<Voucher> = {
    data: [],
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 1,
  };

  const { data: voucherData = defaultPaginated, isLoading, isError } = useGetVouchers({
    page: currentPage,
    limit: itemsPerPage,
    search,
    status: statusFilter === 'All' ? undefined : statusFilter,
    businessId,
  });

  const vouchers: Voucher[] = voucherData.data;
  const totalPages = voucherData.totalPages || 1;
  const totalItems = voucherData.total;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "item":
        return <Gift size={20} className="text-orange-500" />;
      case "ecard":
        return <Wallet size={20} className="text-orange-500" />;
      case "discount":
        return <Percent size={20} className="text-orange-500" />;
      case "ticket":
        return <Ticket size={20} className="text-orange-500" />;
      default:
        return <QrCode size={20} className="text-orange-500" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Redeemed":
        return "bg-blue-100 text-blue-700";
      case "Expired":
        return "bg-gray-100 text-gray-600";
      case "Revoked":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 py-10">Error loading vouchers.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative mt-4 md:mt-6">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vouchers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative mt-4 md:mt-6">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                <Filter size={18} />
                {statusFilter}
                {filterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-md w-40 z-10">
                  {["All", "Active", "Redeemed", "Expired", "Revoked"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status as typeof statusFilter);
                        setFilterOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-orange-50 ${
                        statusFilter === status ? "text-orange-600 font-medium" : "text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VOUCHER GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(voucher.type)}
                  <h3 className="text-lg font-semibold text-gray-800">{voucher.title}</h3>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(
                    voucher.status
                  )}`}
                >
                  {voucher.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{voucher.value}</p>

              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>Expires: {voucher.expiry}</span>
                <span>Issuer: {voucher.issuer}</span>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>

                <button className="flex items-center gap-2 text-sm bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full hover:bg-orange-200 transition">
                  <Download size={16} />
                  Poster
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {vouchers.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium mb-2">No vouchers found</p>
            <p>Try adjusting your filters or create a new voucher.</p>
          </div>
        )}

        {/* PAGINATION */}
        {totalItems > itemsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`px-4 py-2 rounded-lg border border-gray-300 ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-4 py-2 rounded-lg border border-gray-300 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
