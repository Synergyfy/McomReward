"use client"

import { FaCommentDots } from "react-icons/fa"

interface ChatbotFabProps {
  onClick: () => void
}

export default function ChatbotFab({ onClick }: ChatbotFabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-50"
      aria-label="Open chatbot"
    >
      <FaCommentDots className="h-6 w-6" />
    </button>
  )
}
