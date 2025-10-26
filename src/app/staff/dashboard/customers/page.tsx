"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { Customer } from "../type";
import { allCustomers } from "../customerData";





export default function CustomersPage() {
  const [customers, setCustomers] = useState(allCustomers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState("");

  const filtered = useMemo(() => {
    return customers.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, customers]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPointsToAdd("");
  };

  const handleConfirmAdd = () => {
    const add = parseInt(pointsToAdd);
    if (isNaN(add) || add <= 0) return alert("Please enter a valid number.");

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer?.id ? { ...c, points: c.points + add } : c
      )
    );

    setSelectedCustomer(null);
    setPointsToAdd("");
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md p-6 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Customers</h2>
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Points</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-orange-50 transition-all"
              >
                <td className="py-3 px-4 font-medium">{c.name}</td>
                <td className="py-3 px-4 text-gray-600">{c.email}</td>
                <td className="py-3 px-4 text-gray-800">{c.points}</td>
                <td className="py-3 px-4 text-right">
                  <Button
                    onClick={() => handleOpenModal(c)}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Points
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span className="text-gray-500">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add Points Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Points</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-gray-600">
              Add loyalty points for{" "}
              <span className="font-semibold text-gray-800">
                {selectedCustomer?.name}
              </span>
            </p>
            <Input
              type="number"
              placeholder="Enter points"
              value={pointsToAdd}
              onChange={(e) => setPointsToAdd(e.target.value)}
            />
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAdd}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
