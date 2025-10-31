// Lightweight moderation stub: flag if text contains obvious banned tokens
const BANNED = [/\bhate\b/i, /\bracist\b/i, /\bnsfw\b/i];

function moderateText(text = '') {
  const reasons = BANNED.filter(rx => rx.test(text)).map(rx => rx.source);
  return { flagged: reasons.length > 0, reasons };
}

module.exports = { moderateText };






