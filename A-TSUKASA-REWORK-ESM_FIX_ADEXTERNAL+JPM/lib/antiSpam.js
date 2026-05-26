const lastMessage = {}; 
const SPAM_INTERVAL = 600;

export function detectSpam(sender) {
  const now = Date.now();
  if (!lastMessage[sender]) {
    lastMessage[sender] = now;
    return false;
  }

  const diff = now - lastMessage[sender];
  lastMessage[sender] = now;

  return diff < SPAM_INTERVAL; 
}