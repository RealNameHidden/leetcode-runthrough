/*
 * Problem: Two Sum (LeetCode 1)
 *
 * Given an array of integers nums and an integer target, return indices of the
 * two numbers such that they add up to target. Exactly one solution exists.
 * Example: nums = [2,7,11,15], target = 9 → [0,1]
 *
 * Approach:
 * Use a HashMap<value, index>. For each element nums[i]:
 *   - Calculate complement = target - nums[i]
 *   - If complement exists in the map → return [map.get(complement), i]
 *   - Otherwise store nums[i] → i in the map
 *
 * Complexity:
 * - Time:  O(n)  — single pass through the array
 * - Space: O(n)  — HashMap stores up to n entries
 *
 * --- MEMORIZATION NOTES ---
 *
 * The key insight: store value → index (not index → value).
 *   map.get(complement) returns the index of the complement, not its value.
 *   → Don't reverse the mapping or you'll get the wrong return value.
 *
 * Order matters: check complement BEFORE storing current number.
 *   → Avoids using the same element twice (nums[i] + nums[i] = 2*nums[i]).
 *
 * Complement formula: complement = target - nums[i]
 *   → "What number do I need to complete the pair?"
 */

import java.util.HashMap;

class TwoSum {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }

        return new int[] {}; // guaranteed to find a solution
    }
}
