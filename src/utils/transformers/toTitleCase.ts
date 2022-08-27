import { isUppercase } from 'class-validator';

/**
 * Transform any string into Title Case format.
 *
 * By default, it keeps uppercase words unmodified.
 * @param input
 * @param keepUppercase
 * @returns string
 */
export function toTitleCase(input: string, keepUppercase = true) {
  let result = '';
  const words = input.split(' ');
  for (const [currentIdx, word] of words.entries()) {
    const LAST_WORD_IDX = words.length - 1;
    if (keepUppercase && isUppercase(word)) {
      result += word;
    } else {
      result += word[0].toUpperCase() + word.substring(1).toLowerCase();
    }
    if (currentIdx !== LAST_WORD_IDX) result += ' ';
  }
  return result;
}
