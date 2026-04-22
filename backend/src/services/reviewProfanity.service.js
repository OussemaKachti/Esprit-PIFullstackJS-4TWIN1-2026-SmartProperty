/**
 * Modération légère des avis : détection par mots entiers (Unicode),
 * masquage par astérisques, sans stocker le langage offensant en clair côté affichage.
 */

const BLOCKLIST = [
  // English (tokens length typically ≥ 4 to limit false positives)
  'asshole',
  'bastard',
  'bitch',
  'bullshit',
  'cock',
  'crap',
  'crappy',
  'damn',
  'dick',
  'fuck',
  'fucking',
  'pissed',
  'shit',
  'shitty',
  'slut',
  'whore',
  // French
  'merde',
  'mèrde',
  'merdique',
  'putain',
  'connard',
  'connasse',
  'salope',
  'enculer',
  'enculé',
  'encule',
  'niquer',
  'nique',
  'foutre',
  'debile',
  'débile',
  'cretin',
  'crétin',
  'salaud',
  'pourriture',
  'chier',
  'chiasse',
  'pute',
  'putes',
  'fdp',
  'ntm',
];

function stripDiacritics(str) {
  return String(str).normalize('NFD').replace(/\p{M}+/gu, '');
}

function fold(str) {
  return stripDiacritics(String(str).toLowerCase());
}

const blockSet = new Set(BLOCKLIST.map((w) => fold(w)));

const WORD_RE = /\p{L}+/gu;

/**
 * @param {string} rawComment
 * @returns {{ maskedComment: string, hadProfanity: boolean }}
 */
function moderateReviewComment(rawComment) {
  const input = typeof rawComment === 'string' ? rawComment.trim() : '';
  if (!input) {
    return { maskedComment: '', hadProfanity: false };
  }

  let hadProfanity = false;
  const maskedComment = input.replace(WORD_RE, (word) => {
    if (blockSet.has(fold(word))) {
      hadProfanity = true;
      return '*'.repeat(word.length);
    }
    return word;
  });

  return { maskedComment, hadProfanity };
}

module.exports = {
  moderateReviewComment,
};
