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
} from "lucide-react";
import { useGuide } from '@/context/GuideContext';
import { useEffect } from 'react';

export default function VouchersPage() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const { startGuide } = useGuide();

  // Check if there are no vouchers, might be a good time to start guide?
  // Or maybe on mount if param is set.
  // The user requested "includes creating campaigns vouchers staffs rewards".
  // Assuming if they land here they might want to know how to create one.
  // I'll add a 'Create Voucher' button which triggers the guide if clicked (and opens modal/page).
  // Or just on mount.
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const vouchers = [
    { id: "VCH-001", title: "Free Coffee", type: "item", value: "200 pts", expiry: "2025-12-31", status: "Active", issuer: "Admin" },
    { id: "VCH-002", title: "£20 Hospitality E-Card", type: "ecard", value: "£20", expiry: "2026-01-01", status: "Redeemed", issuer: "You" },
    { id: "VCH-003", title: "10% Discount", type: "discount", value: "10% off", expiry: "2025-11-15", status: "Active", issuer: "Admin" },
    { id: "VCH-004", title: "Sandwich Meal", type: "item", value: "500 pts", expiry: "2025-12-10", status: "Expired", issuer: "You" },
    { id: "VCH-005", title: "Event Ticket", type: "ticket", value: "VIP Entry", expiry: "2025-12-20", status: "Active", issuer: "You" },
    { id: "VCH-006", title: "Free Dessert", type: "item", value: "300 pts", expiry: "2025-11-01", status: "Redeemed", issuer: "Admin" },
    { id: "VCH-007", title: "£50 Gift Card", type: "ecard", value: "£50", expiry: "2026-02-10", status: "Active", issuer: "Admin" },
    { id: "VCH-008", title: "2 for 1 Meal", type: "discount", value: "Buy 1 Get 1 Free", expiry: "2025-11-30", status: "Expired", issuer: "You" },
  ];

  // FILTERING LOGIC
  const filteredVouchers = vouchers
    .filter((v) => {
      const matchesSearch =
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.id.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = statusFilter === "All" || v.status === statusFilter;
      return matchesSearch && matchesFilter;
    });

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVouchers = filteredVouchers.slice(startIndex, startIndex + itemsPerPage);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex justify-between items-center w-full md:w-auto">
             <h1 className="text-3xl font-bold text-gray-900 mr-4">Vouchers</h1>
             <button
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 md:hidden"
                onClick={() => startGuide('VOUCHER')}
             >
                + Create
             </button>
          </div>

          <div className="flex items-center gap-3">
             <button
                className="hidden md:block bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 mr-4"
                onClick={() => startGuide('VOUCHER')}
             >
                + Create Voucher
             </button>
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
                  {["All", "Active", "Redeemed", "Expired"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
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
          {currentVouchers.map((voucher) => (
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
        {filteredVouchers.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium mb-2">No vouchers found</p>
            <p>Try adjusting your filters or create a new voucher.</p>
          </div>
        )}

        {/* PAGINATION */}
        {filteredVouchers.length > itemsPerPage && (
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
