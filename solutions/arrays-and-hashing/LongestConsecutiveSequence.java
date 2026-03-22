/*
 * Problem: Longest Consecutive Sequence (LeetCode 128)
 *
 * Given an unsorted array of integers nums, return the length of the longest
 * consecutive elements sequence. Must run in O(n) time.
 *
 * Example: nums = [100,4,200,1,3,2] → 4   (sequence: 1,2,3,4)
 * Example: nums = [0,3,7,2,5,8,4,6,0,1]  → 9   (sequence: 0,1,2,...,8)
 *
 * Approach: HashSet + Start-of-Sequence Detection
 * 1. Add all numbers to a HashSet for O(1) lookups.
 * 2. For each number in the set:
 *    - SKIP if (num - 1) is in the set → num is not the start of a sequence.
 *    - Otherwise count upward: num, num+1, num+2, ... while present in set.
 *    - Update maxLen if this chain is longer.
 *
 * Complexity:
 * - Time:  O(n) — each number is "started from" at most once, "counted" at most once
 * - Space: O(n) — HashSet stores all unique numbers
 *
 * --- MEMORIZATION NOTES ---
 *
 * Key trick: only start counting from the BEGINNING of a sequence
 *   if (set.contains(num - 1)) → skip, someone earlier will count this number
 *   else → num IS the sequence start, count from here
 *
 * Why O(n) not O(n²)?
 *   Each number is visited in the while-loop at most once total across ALL starts.
 *   A number can only be the "current" in a chain extension if a unique start exists.
 *
 * Common mistake: iterating over nums[] instead of set — duplicates cause extra work
 *   (still O(n) but cleaner to iterate set to avoid counting same starts twice)
 */

import java.util.HashSet;

class LongestConsecutiveSequence {
    public int longestConsecutive(int[] nums) {
        HashSet<Integer> set = new HashSet<>();
        for (int num : nums) {
            set.add(num);
        }

        int maxLen = 0;

        for (int num : set) {
            // Only start counting if num is the beginning of a sequence
            if (!set.contains(num - 1)) {
                int cur = num;
                int len = 1;

                while (set.contains(cur + 1)) {
                    cur++;
                    len++;
                }

                maxLen = Math.max(maxLen, len);
            }
        }

        return maxLen;
    }
}
