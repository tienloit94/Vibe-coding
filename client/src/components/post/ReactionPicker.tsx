import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

interface ReactionPickerProps {
  onReact: (type: ReactionType) => void;
  currentReaction?: ReactionType | null;
}

const reactions: {
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
}[] = [
  { type: "like", emoji: "👍", label: "Thích", color: "text-blue-500" },
  { type: "love", emoji: "❤️", label: "Yêu thích", color: "text-red-500" },
  { type: "haha", emoji: "😂", label: "Haha", color: "text-yellow-500" },
  { type: "wow", emoji: "😮", label: "Wow", color: "text-orange-500" },
  { type: "sad", emoji: "😢", label: "Buồn", color: "text-yellow-600" },
  { type: "angry", emoji: "😠", label: "Phẫn nộ", color: "text-red-600" },
];

export default function ReactionPicker({
  onReact,
  currentReaction,
}: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(
    null
  );

  const handleReactionClick = (type: ReactionType) => {
    onReact(type);
    setShowPicker(false);
  };

  const currentReactionData = reactions.find((r) => r.type === currentReaction);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowPicker(true)}
      onMouseLeave={() => {
        setShowPicker(false);
        setHoveredReaction(null);
      }}
    >
      {/* Current Reaction or Like Button */}
      <button
        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
          currentReaction
            ? currentReactionData?.color
            : "text-gray-600 dark:text-gray-400"
        }`}
        onClick={() => !currentReaction && handleReactionClick("like")}
      >
        <span className="text-lg">{currentReactionData?.emoji || "👍"}</span>
        <span className="text-sm font-medium">
          {currentReactionData?.label || "Thích"}
        </span>
      </button>

      {/* Reaction Picker Popup */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-2 py-2 flex space-x-1 z-50"
          >
            {reactions.map((reaction) => (
              <motion.button
                key={reaction.type}
                whileHover={{ scale: 1.3, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReactionClick(reaction.type)}
                onMouseEnter={() => setHoveredReaction(reaction.type)}
                onMouseLeave={() => setHoveredReaction(null)}
                className="relative w-10 h-10 flex items-center justify-center text-2xl transition-transform"
                title={reaction.label}
              >
                {reaction.emoji}
                {hoveredReaction === reaction.type && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                  >
                    {reaction.label}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to get reaction summary
export function getReactionSummary(
  reactions: Array<{ type: ReactionType; user: any }>
) {
  if (!reactions || reactions.length === 0) return null;

  const reactionCounts: Record<ReactionType, number> = {
    like: 0,
    love: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  };

  reactions.forEach((reaction) => {
    reactionCounts[reaction.type]++;
  });

  const sortedReactions = Object.entries(reactionCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const reactionEmojis: Record<ReactionType, string> = {
    like: "👍",
    love: "❤️",
    haha: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😠",
  };

  return {
    emojis: sortedReactions.map(
      ([type]) => reactionEmojis[type as ReactionType]
    ),
    total: reactions.length,
  };
}
