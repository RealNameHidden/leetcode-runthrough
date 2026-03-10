/*
 * Problem: 3. Longest Substring Without Repeating Characters (LeetCode)
 *
 * Description:
 * Given a string s, return the length of the longest substring that contains
 * no repeated characters.
 *
 * Approach:
 * Sliding window with a hash map:
 * - Expand the right pointer across the string.
 * - Store the latest index of each character.
 * - If the current character was already inside the window, move left just
 *   past its previous occurrence.
 *
 * Complexity:
 * - Time: O(n) - each pointer moves forward at most n times
 * - Space: O(min(n, alphabet)) - map of last seen indices
 */

import java.util.HashMap;
import java.util.Map;

public class LongestSubstringWithoutRepeatingCharacters {

    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int left = 0;
        int best = 0;

        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);

            if (lastSeen.containsKey(ch) && lastSeen.get(ch) >= left) {
                left = lastSeen.get(ch) + 1;
            }

            lastSeen.put(ch, right);
            best = Math.max(best, right - left + 1);
        }

        return best;
    }
}
