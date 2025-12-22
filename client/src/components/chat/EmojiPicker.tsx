import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
  '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
  '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
  '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
  '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
  '🤠', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘',
  '🤙', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌',
  '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿',
  '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁',
  '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓',
  '💗', '💖', '💘', '💝', '🔥', '✨', '⭐', '🌟',
  '💫', '💥', '💢', '💦', '💨', '🎉', '🎊', '🎈',
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

export default function EmojiPicker({ onEmojiSelect, disabled }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        title="Add emoji"
        disabled={disabled}
      >
        <Smile className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Emoji Picker */}
          <div className="absolute bottom-12 right-0 z-20 w-80 rounded-lg border bg-white p-4 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Emojis</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid max-h-64 grid-cols-8 gap-1 overflow-y-auto">
              {EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onEmojiSelect(emoji);
                    setIsOpen(false);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-gray-100"
                >
                  <span className="text-xl">{emoji}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
