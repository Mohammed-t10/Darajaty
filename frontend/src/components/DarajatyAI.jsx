import { useState, useRef, useEffect, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BotIcon as Robot, Stars, Send, Loader, CircleStop } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { axiosInstance as axios } from "@/api/axiosInstance"
import { useAuthStore } from "@/store/authStore"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';


const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const words = text.split(" "); // Split the text into words
  const chunkSize = 10; // Number of words to display at a time

  useEffect(() => {
    if (currentIndex < words.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => (prev ? prev + " " : "") + words.slice(currentIndex, currentIndex + chunkSize).join(" "));
        setCurrentIndex((prev) => prev + chunkSize);
      }, 100); // Adjust timing for better user experience

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  return <AIResponse response={displayedText} />;
};

const AIResponse = memo(({ response }) => {
    return (
        <div className="prose max-w-full dark:prose-invert">
            <ReactMarkdown
                components={{
                    code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || ''); // Detect language
                        return !inline ? (
                            <div className="overflow-x-auto leading-relaxed my-4">
                                <SyntaxHighlighter
                                    style={dracula}
                                    language={match ? match[1] : 'plaintext'}
                                    wrapLongLines={true}
                                    customStyle={{
                                        direction: 'ltr',
                                        textAlign: 'left',
                                        borderRadius: '1rem',
                                        padding: '1rem',
                                    }}
                                    className="text-xs sm:text-sm"
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code
                                {...props}
                                className="bg-gray-800 text-white px-1 py-0.5 rounded text-sm"
                            >
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {response}
            </ReactMarkdown>
        </div>
    );
});

export default function DarajatyAI() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [abortController, setAbortController] = useState(null);
  const [error, setError] = useState(null)
  const chatContainerRef = useRef(null)
  const { user } = useAuthStore()
  const username = user.name.split(' ')[0]
  let isFirstMessage = true

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatContainerRef])

  const toggleOpen = () => setIsOpen(!isOpen)

  const handleSubmit = async (e) => {
    e.preventDefault()
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    if (!input.trim()) return

    const newMessage = { text: input, isUser: true }
    setMessages([...messages, newMessage])
    setInput("")
    setIsLoading(true)
    setError(null)
    
    let prompt = '';
    
    if (isFirstMessage) {
    prompt = `My name is ${username} and you should reply to me in the language of my prmompt, here’s my prompt: "${input}"`
    isFirstMessage = false
    } else {
      prompt = input
    }
    
    const controller = new AbortController()
    const signal = controller.signal
    setAbortController(controller)

    try {
      const response = await axios.post("/chat", { prompt }, { signal });
      const aiResponse = response.data.reply;
      setMessages((prev) => [...prev, { text: aiResponse, isUser: false }])
    } catch (err) {
      if (err.message !== "canceled") {
        setError("حدث خطأ ما")
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCancelRequest = () => {
    if (abortController) {
      // Abort the request
      abortController.abort()
      setAbortController(null)
    }
  }

  return (
    <>
<motion.button
  className={`fixed bottom-4 left-4 p-2 bg-gradient-to-r from-primary to-pink-700 text-white rounded-full shadow-lg z-50 flex items-center overflow-hidden ${isOpen ? "opacity-40" : ""}`}
  animate={{
    left: isOpen ? "calc(100% - 100px)" : "1rem",
    width: isOpen ? "120px" : "50px",
    bottom: isOpen ? "4rem" : "1rem",
  }}
  transition={{ duration: 0.4, ease: "easeInOut" }} // Smooth animation
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={toggleOpen}
>
  <Robot className="w-8 h-8" />
  {isOpen && <span className="ml-2 font-semibold">محادثة</span>}
</motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: "100%" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 w-[95%] h-[80%] mx-auto bg-background rounded-t-3xl shadow-2xl overflow-hidden z-40"
          >
            <div className="h-full flex flex-col">
              <header className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-pink-700 text-white">
                <div className="flex items-center space-x-2">
                  <Robot className="w-8 h-8" />
                  <h1 className="text-2xl font-bold">Darajaty AI</h1>
                </div>
                <Stars className="w-6 h-6" />
              </header>

              <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto mb-4 space-y-4"
                >
                  {messages.map((message, index) => (
                    <motion.div
                      dir="rtl"
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-right p-2 rounded-lg ${
                        message.isUser ? "bg-purple-100 dark:bg-pink-700 mr-auto" : "bg-gray-100 dark:bg-gray-700 ml-auto"
                      } max-w-[80%]`}
                    >
                      <TypewriterText text={message.text} />
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-center">
                      <Loader className="w-6 h-6 animate-spin text-purple-500 dark:text-pink-500" />
                    </div>
                  )}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-2 bg-red-100 text-red-700 rounded-lg text-center mx-auto"
                    >
                      {error}
                    </motion.div>
                  )}
                  {
                    messages.length === 0 && 
                    <div className="flex flex-col items-center justify-center h-full w-full opacity-70 backdrop-blur-md rounded-lg p-6">
  {/* AI Logo with Gradient */}
  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-700">
    Darajaty AI
  </div>

  {/* Icon */}
  <Robot className="w-20 h-20 text-gray-500/70 mt-4" />

  {/* Placeholder Message */}
  <p className="text-gray-600 mt-4 text-center">لا توجد رسائل بعد، ابدأ المحادثة</p>

  {/* Suggested Actions */}
  <div className="flex flex-row-reverse gap-2 mt-6">
    <button className="px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary text-sm">
      اسأل سؤالاً
    </button>
    <button className="px-4 py-2 rounded-full bg-pink-700/10 text-pink-700 border border-pink-700 text-sm">
      احصل على مساعدة
    </button>
  </div>
</div>
                  }
                </div>
                <form className="flex gap-2 mt-auto" dir="rtl">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="رسالة..."
                    className="text-right flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mt-auto dark:bg-gray-900"
                  />
                  {!isLoading ?
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gradient-to-r from-primary to-pink-700 rounded-lg text-white"
                    onClick={handleSubmit}
                  >
                  <Send className="w-6 h-6 -rotate-90" />
                  </motion.button>
                  :
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gradient-to-r from-primary to-pink-700 rounded-lg text-white"
                    onClick={handleCancelRequest}
                  >
                  <CircleStop className="w-6 h-6" />
                  </motion.button>
                  }
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

