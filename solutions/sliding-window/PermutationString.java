import java.util.Arrays;

/**
 * LC 567 — Permutation in String
 *
 * Problem: return true if s2 contains a contiguous substring that is a
 * permutation of s1 (same characters, any order).
 *
 * Approach: fixed-size sliding window + int[26] frequency count.
 *   - A permutation must be the same length as s1, so the window is fixed at
 *     s1.length(). We never need to expand or shrink.
 *   - Two strings are permutations iff their character frequency arrays are
 *     equal. Comparing int[26] is O(26) = O(1) — no sorting, no HashMap.
 *
 * Optimization: instead of rebuilding the window's frequency array from
 *   scratch at each position (O(n·m)), we slide in O(1) per step:
 *     cs2[entering_char]++
 *     cs2[leaving_char]--
 *   This keeps the total time O(n).
 *
 * Time:  O(n)  — single pass over s2, O(1) compare per step
 * Space: O(1)  — two fixed int[26] arrays (26 lowercase letters)
 */
class PermutationString {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;

        int[] cs1 = new int[26];
        int[] cs2 = new int[26];

        // s1.length() is the window size. Seed cs1 with all of s1 and cs2
        // with the first window of s2 (indices 0..s1.length()-1).
        for (int i = 0; i < s1.length(); i++) {
            cs1[s1.charAt(i) - 'a']++;
            cs2[s2.charAt(i) - 'a']++;
        }

        // i points at the character entering the right edge of the window.
        // The check happens BEFORE sliding, so the window being tested is
        // s2[i-s1.length() .. i-1] — one step behind i.
        for (int i = s1.length(); i < s2.length(); i++) {
            if (Arrays.equals(cs1, cs2)) return true;

            cs2[s2.charAt(i) - 'a']++;                       // add right char
            cs2[s2.charAt(i - s1.length()) - 'a']--;         // drop left char
        }

        // Don't return false here! The loop checks before sliding, so the
        // final window (the last s1.length() chars of s2) is never tested
        // inside the loop — we must check it explicitly.
        return Arrays.equals(cs1, cs2);
    }
}
