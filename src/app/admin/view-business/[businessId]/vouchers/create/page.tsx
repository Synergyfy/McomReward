"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Calendar, Gift, Percent, Ticket, Wallet } from "lucide-react";

export default function VoucherGenerator() {
  const [voucher, setVoucher] = useState({
    template: "item",
    title: "",
    businessName: "Loyalty CardX",
    value: "",
    expiry: "",
    quantity: 1,
    rules: "",
    code: "",
  });

  const [previewCode, setPreviewCode] = useState("");

  // Generate a mock code automatically
  useEffect(() => {
    setPreviewCode(`LCX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
  }, [voucher.title, voucher.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVoucher({ ...voucher, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Voucher "${voucher.title}" created successfully!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col md:flex-row gap-8">
      {/* LEFT: FORM */}
      <div className="w-full md:w-1/2 bg-white shadow-sm border rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">
          Create a New Voucher
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voucher Type
            </label>
            <select
              name="template"
              value={voucher.template}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="item">Item Voucher (e.g. Free Coffee)</option>
              <option value="discount">Discount Voucher</option>
              <option value="ecard">E-Card (Monetary Value)</option>
              <option value="ticket">Event Ticket</option>
              <option value="bundle">Bundle Voucher</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voucher Title
            </label>
            <input
              type="text"
              name="title"
              value={voucher.title}
              onChange={handleChange}
              placeholder="e.g. Free Coffee or £20 Gift Card"
              className="w-full border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value / Points Cost
            </label>
            <input
              type="text"
              name="value"
              value={voucher.value}
              onChange={handleChange}
              placeholder="e.g. 200 pts or £20"
              className="w-full border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiry"
              value={voucher.expiry}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={voucher.quantity}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Redemption Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Redemption Rules
            </label>
            <textarea
              name="rules"
              value={voucher.rules}
              onChange={handleChange}
              placeholder="e.g. Valid for one item per day. Non-transferable."
              rows={3}
              className="w-full border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition"
          >
            Issue Voucher
          </button>
        </form>
      </div>

      {/* RIGHT: PREVIEW */}
      <div className="w-full md:w-1/2 bg-white shadow-sm border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Voucher Preview
        </h2>

        <div className="relative bg-orange-50 rounded-2xl border border-orange-100 w-80 p-6 shadow-inner">
          {/* Icon based on type */}
          <div className="mb-4">
            {voucher.template === "item" && <Gift size={36} className="mx-auto text-orange-500" />}
            {voucher.template === "discount" && <Percent size={36} className="mx-auto text-orange-500" />}
            {voucher.template === "ecard" && <Wallet size={36} className="mx-auto text-orange-500" />}
            {voucher.template === "ticket" && <Ticket size={36} className="mx-auto text-orange-500" />}
          </div>

          <h3 className="text-2xl font-bold text-gray-800">{voucher.title || "Voucher Title"}</h3>
          <p className="text-gray-600 mt-1">
            {voucher.value ? `${voucher.value}` : "Value / Points"}
          </p>

          <div className="my-4 flex flex-col items-center">
            <div className="bg-white border border-gray-200 p-3 rounded-xl">
              <QrCode size={64} className="text-gray-700" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{previewCode}</p>
          </div>

          <p className="text-sm text-gray-600">
            <Calendar className="inline mr-1 w-4 h-4" />
            Expires: {voucher.expiry || "DD/MM/YYYY"}
          </p>

          <p className="text-xs text-gray-500 mt-2">
            {voucher.rules || "Short redemption terms go here..."}
          </p>
        </div>

        <p className="text-sm text-gray-400 mt-4">
          Scan QR to redeem at {voucher.businessName}
        </p>
      </div>
    </div>
  );
}
