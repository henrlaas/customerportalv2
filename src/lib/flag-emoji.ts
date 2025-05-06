
// Map country codes to flag emojis
export function getFlagEmoji(countryCode: string): string {
  if (!countryCode) return '';
  
  // Convert country code to regional indicator symbols
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  // Convert code points to emoji
  return String.fromCodePoint(...codePoints);
}
