"use client";

import { PlayCircle, Video, Search } from "lucide-react";
import { useState } from "react";

const tutorialVideos = [
  {
    id: 1,
    title: "How to Earn Points on Loyalty CardX",
    description: "Learn the basics of earning loyalty points across your favorite businesses.",
    videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    category: "Getting Started",
  },
  {
    id: 2,
    title: "Redeeming Rewards Made Easy",
    description: "A step-by-step walkthrough of claiming rewards from your campaigns.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Rewards",
  },
  {
    id: 3,
    title: "Managing Your Wallet & Points",
    description: "Discover how to view transactions, add balance, and monitor points.",
    videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    category: "Wallet",
  },
];

export default function VideoTutorialsPage() {
  const [search, setSearch] = useState("");

  const filteredVideos = tutorialVideos.filter((vid) =>
    vid.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:pt-28">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Video Tutorials</h1>
      <p className="text-gray-600 mb-6">
        Watch quick tutorials to learn how to use Loyalty CardX effectively.
      </p>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search tutorials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-orange-400 focus:outline-none"
        />
      </div>

      {/* Video Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg transition"
          >
            <div className="relative">
              <iframe
                className="w-full h-48"
                src={video.videoUrl}
                title={video.title}
                allowFullScreen
              />
              <PlayCircle className="absolute top-2 left-2 text-orange-500 bg-white rounded-full" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">{video.title}</h3>
              <p className="text-sm text-gray-500">{video.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
