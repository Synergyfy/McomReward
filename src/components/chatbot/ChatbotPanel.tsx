"use client"

import { useState, useRef, useEffect } from "react"
import { IoClose, IoSend } from "react-icons/io5"

interface ChatbotPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  text: string
  sender: "user" | "bot"
}

export default function ChatbotPanel({ isOpen, onClose }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I help you today?", sender: "bot" },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!isOpen) return null

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return

    const newUserMessage: Message = { text: inputMessage, sender: "user" }
    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setInputMessage("")

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        text: `You said: "${newUserMessage.text}". I'm a mock chatbot and can't actually help yet!`,
        sender: "bot",
      }
      setMessages((prevMessages) => [...prevMessages, botResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col z-50">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Chatbot</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <IoClose className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 flex items-center">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 bg-primary text-primary-foreground p-2 rounded-r-md hover:bg-primary/90 transition-colors"
        >
          <IoSend className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
