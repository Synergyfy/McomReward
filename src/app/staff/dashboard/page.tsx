"use client";

import { motion } from "framer-motion";
import { Gift, LogOut, Menu, UserCircle, Users } from "lucide-react";

const stats = [
  {
    label: "Total Vouchers Redeemed",
    value: "1,250",
    icon: <Gift className="h-6 w-6" />,
  },
  {
    label: "Active Customers",
    value: "3,400",
    icon: <Users className="h-6 w-6" />,
  },
  {
    label: "Pending Requests",
    value: "24",
    icon: <UserCircle className="h-6 w-6" />,
  },
];

export default function StaffDashboard() {



  const activities = [
    {
      id: 1,
      customer: "Ama K.",
      voucher: "₵50 Beauty Voucher",
      time: "10 mins ago",
    },
    {
      id: 2,
      customer: "Kwame A.",
      voucher: "₵100 Gift Card",
      time: "25 mins ago",
    },
    {
      id: 3,
      customer: "Efua B.",
      voucher: "₵30 Spa Reward",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="flex min-h-screen bg-white">
  
      {/* 💻 Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* 🔝 Top Bar */}
      
        {/* 📊 Dashboard Body */}
        <main className="flex-1 p-4 md:p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3"
              >
                <div className="bg-pink-100 text-orange-600 p-3 rounded-full">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-xl font-bold text-gray-800">
                    {item.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Redemptions</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-t border-gray-100">
                <thead className="text-gray-500 border-b bg-gray-50">
                  <tr>
                    <th className="py-2 px-3">Customer</th>
                    <th className="py-2 px-3">Voucher</th>
                    <th className="py-2 px-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b last:border-none hover:bg-orange-50 transition-colors"
                    >
                      <td className="py-2 px-3 font-medium text-gray-800">
                        {a.customer}
                      </td>
                      <td className="py-2 px-3 text-gray-600">{a.voucher}</td>
                      <td className="py-2 px-3 text-gray-500">{a.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
