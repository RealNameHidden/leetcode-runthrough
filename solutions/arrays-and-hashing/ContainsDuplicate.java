/*
 * Problem: Contains Duplicate (LeetCode 217)
 *
 * Given an integer array nums, return true if any value appears at least twice
 * in the array, and return false if every element is distinct.
 * Example: nums = [1,2,3,1] → true
 *
 * Approach:
 * Use a HashSet. Iterate through nums:
 *   - If the set already contains the current number → duplicate found, return true
 *   - Otherwise add the number to the set
 * Return false if the loop completes without finding a duplicate.
 *
 * Complexity:
 * - Time:  O(n)  — single pass through the array
 * - Space: O(n)  — HashSet stores up to n distinct elements
 *
 * --- MEMORIZATION NOTES ---
 *
 * HashSet.add() returns false if the element already exists:
 *   if (!set.add(num)) return true;
 *   → Compact one-liner; no separate contains() call needed.
 *
 * Alternative one-liner check:
 *   if (!set.add(num)) return true;
 *   vs.
 *   if (set.contains(num)) return true; set.add(num);
 *   Both are correct — the add-return shortcut is idiomatic Java.
 */

import java.util.HashSet;

class ContainsDuplicate {
    public boolean containsDuplicate(int[] nums) {
        HashSet<Integer> seen = new HashSet<>();
        for (int num : nums) {
            if (seen.contains(num)) {
                return true;
            }
            seen.add(num);
        }
        return false;
    }
}
