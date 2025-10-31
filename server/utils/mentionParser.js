// Parse @mentions from message content
const parseMentions = (content) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      username: match[1],
      position: match.index,
      length: match[0].length
    });
  }

  return mentions;
};

// Extract mentioned usernames
const extractMentionedUsernames = (content) => {
  const mentionRegex = /@(\w+)/g;
  const usernames = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (!usernames.includes(match[1])) {
      usernames.push(match[1]);
    }
  }

  return usernames;
};

module.exports = { parseMentions, extractMentionedUsernames };






