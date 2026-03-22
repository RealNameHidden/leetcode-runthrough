/*
 * Problem: Valid Anagram (LeetCode 242)
 *
 * Given two strings s and t, return true if t is an anagram of s,
 * and false otherwise.
 * Example: s = "anagram", t = "nagaram" → true
 *          s = "rat",     t = "car"     → false
 *
 * Approach:
 * Use an int[26] character count array (assumes lowercase English letters only):
 *   - Increment count[c - 'a'] for each char in s
 *   - Decrement count[c - 'a'] for each char in t
 *   - If any count is non-zero → not an anagram → return false
 *
 * Complexity:
 * - Time:  O(n)  — two linear passes (length of s and t)
 * - Space: O(1)  — fixed-size int[26] regardless of input size
 *
 * --- MEMORIZATION NOTES ---
 *
 * int[26] trick:
 *   int[] count = new int[26];
 *   count[c - 'a']++  // 'a' → 0, 'b' → 1, ..., 'z' → 25
 *   → Eliminates HashMap overhead; O(1) space because array size is constant.
 *
 * Early exit: if (s.length() != t.length()) return false;
 *   → Anagrams must have the same length. Skip the counting entirely if lengths differ.
 *
 * Alternative: Sort both strings and compare with .equals() — O(n log n) time.
 */

class ValidAnagram {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) {
            return false;
        }

        int[] count = new int[26];

        for (char c : s.toCharArray()) {
            count[c - 'a']++;
        }
        for (char c : t.toCharArray()) {
            count[c - 'a']--;
        }

        for (int freq : count) {
            if (freq != 0) {
                return false;
            }
        }

        return true;
    }
}
