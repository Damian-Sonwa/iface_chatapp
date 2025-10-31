// Component to highlight @mentions in message content
import { Link } from 'lucide-react';

export const highlightMentions = (content, currentUsername) => {
  if (!content) return content;

  const mentionRegex = /@(\w+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index)
      });
    }

    // Add mention
    const isSelf = match[1] === currentUsername;
    parts.push({
      type: 'mention',
      content: match[0],
      username: match[1],
      isSelf
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex)
    });
  }

  return parts;
};

export const MentionText = ({ parts }) => {
  return (
    <span>
      {parts.map((part, idx) => {
        if (part.type === 'mention') {
          return (
            <span
              key={idx}
              className={`font-semibold ${
                part.isSelf
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {part.content}
            </span>
          );
        }
        return <span key={idx}>{part.content}</span>;
      })}
    </span>
  );
};







