/*
 * LeetCode 153 — Find Minimum in Rotated Sorted Array
 *
 * Problem: Find the minimum element in a rotated sorted array.
 * A rotated sorted array is an originally sorted array that has been rotated at some pivot.
 * Example: [3,4,5,1,2] is [1,2,3,4,5] rotated at pivot 3.
 *
 * Approach: Binary search with mid vs. right comparison
 * - If nums[mid] > nums[right], the minimum is in the right half (including mid+1)
 * - Otherwise, the minimum is in the left half (possibly mid itself, so don't exclude)
 * - This comparison works because the right side is always in correct sorted order
 *
 * Complexity:
 * - Time: O(log n) — binary search eliminates half the array each iteration
 * - Space: O(1) — only constant pointers
 */

class Solution {
    /**
     * Finds the minimum element in a rotated sorted array using binary search.
     * @param nums A rotated sorted array of distinct integers
     * @return The minimum element in the array
     */
    public int findMin(int[] nums) {
        // Initialize left and right pointers to array boundaries
        int left = 0;
        int right = nums.length - 1;

        // Binary search: shrink search space until left == right
        while (left < right) {
            // Avoid overflow: compute mid as left + (right - left) / 2
            int mid = left + (right - left) / 2;

            // Key insight: compare mid with right (not left)
            // If mid > right, minimum must be in right half (rotation point is at or before mid)
            if (nums[mid] > nums[right]) {
                // Exclude mid since it's larger than right; min is to the right
                left = mid + 1;
            } else {
                // Mid <= right means min could be at mid or to the left; include mid
                right = mid;
            }
        }

        // When left == right, we've found the minimum
        return nums[left];
    }
}
