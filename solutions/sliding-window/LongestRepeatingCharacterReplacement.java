/*
 * Problem: 424. Longest Repeating Character Replacement (LeetCode)
 *
 * Description:
 * You are given a string s and an integer k. You may change at most k characters
 * in any substring so that the whole substring becomes the same letter.
 * Return the length of the longest such substring.
 *
 * Approach:
 * Sliding window with frequency counts:
 * - Expand the window with the right pointer.
 * - Track the count of the most frequent character in the current scan.
 * - If the window needs more than k replacements, shrink from the left.
 *
 * Complexity:
 * - Time: O(n) - each pointer moves forward at most n times
 * - Space: O(1) - fixed-size frequency array for uppercase letters
 */

public class LongestRepeatingCharacterReplacement {

    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0;
        int maxFrequency = 0;
        int best = 0;

        for (int right = 0; right < s.length(); right++) {
            int idx = s.charAt(right) - 'A';
            count[idx]++;
            maxFrequency = Math.max(maxFrequency, count[idx]);

            while ((right - left + 1) - maxFrequency > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }

            best = Math.max(best, right - left + 1);
        }

        return best;
    }
}
