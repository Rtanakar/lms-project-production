// ============================================================================
// TagListInput.tsx — Animated tag list (Enter / Add button → chip with motion)
// ============================================================================
// Reusable for any string[] field: tags, whatYouLearn, prerequisites, includes.
// Pattern matches the employee form's skills input — orange-brand themed.
//
// Behavior:
//   - Type → Enter (or click +) → adds to list (trimmed, dedupe)
//   - X on chip removes
//   - Motion: chip scales in/out, layout animation on reorder
//   - Disabled state mirrored throughout
// ============================================================================

"use client";

import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TagListInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Max number of tags (mirrors backend cap). */
  max?: number;
  /** Max length of each tag. */
  maxLength?: number;
  /** Convert to lowercase before storing (for tags). Default: true. */
  lowercase?: boolean;
}

export function TagListInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  disabled,
  max = 20,
  maxLength = 40,
  lowercase = true,
}: TagListInputProps) {
  const [input, setInput] = useState("");

  const add = () => {
    const raw = input.trim();
    if (!raw) return;
    if (value.length >= max) return;
    const normalized = lowercase ? raw.toLowerCase() : raw;
    if (value.includes(normalized)) {
      setInput("");
      return;
    }
    onChange([...value, normalized.slice(0, maxLength)]);
    setInput("");
  };

  const remove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
      return;
    }
    // Backspace on empty input → remove last tag (Notion-style)
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      e.preventDefault();
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Input + add button */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled || value.length >= max}
          maxLength={maxLength}
          className="flex-1 border-[rgba(255,90,31,0.15)] bg-[rgba(15,10,7,0.55)] text-white placeholder:text-white/40 focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/25"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={add}
          disabled={disabled || !input.trim() || value.length >= max}
          className="border-[rgba(255,90,31,0.2)] hover:border-[#FF5A1F] hover:bg-[rgba(255,90,31,0.08)]"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Tag chips — motion list with layout + enter/exit */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence mode="popLayout">
            {value.map((tag) => (
              <motion.span
                key={tag}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,90,31,0.25)] bg-[rgba(255,90,31,0.1)] px-3 py-1 text-xs text-[#FFB07A]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => remove(tag)}
                  disabled={disabled}
                  className="rounded-full p-0.5 transition-colors hover:bg-[rgba(255,90,31,0.2)]"
                >
                  <X className="size-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Counter — only when near cap */}
      {value.length >= max - 2 && (
        <p className="text-[10px] text-white/40">
          {value.length} / {max}
        </p>
      )}
    </div>
  );
}
