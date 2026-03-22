/*
 * Problem: Product of Array Except Self (LeetCode 238)
 *
 * Given an integer array nums, return an array answer such that answer[i] is
 * equal to the product of all the elements of nums except nums[i].
 * Must be solved without using division and in O(n) time.
 *
 * Example: nums = [1,2,3,4] → [24,12,8,6]
 *
 * Approach: Two-pass prefix/suffix product (no division)
 * 1. Pass 1 (left → right): output[i] = product of all elements to the LEFT of i
 *    output[0] = 1 (nothing to the left)
 *    output[i] = output[i-1] * nums[i-1]
 * 2. Pass 2 (right → left): multiply output[i] by running suffix variable
 *    suffix starts at 1, then suffix *= nums[i] after each update
 *
 * Complexity:
 * - Time:  O(n) — two linear passes
 * - Space: O(1) — output array excluded; only 'suffix' variable used
 *
 * --- MEMORIZATION NOTES ---
 *
 * Two passes with a running variable:
 *   Pass 1: output[i] = prefix product (1 * nums[0] * nums[1] * ... * nums[i-1])
 *   Pass 2: suffix = 1; right → left: output[i] *= suffix; suffix *= nums[i]
 *
 * Think: "left products first, then right products in one variable"
 *
 * Why no division?
 *   Division fails if any element is zero (0/0 undefined).
 *   Prefix/suffix avoids this entirely — zeros are handled naturally.
 *
 * Key trap: update suffix AFTER multiplying output[i], not before.
 */

class ProductOfArrayExceptSelf {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] output = new int[n];

        // Pass 1: output[i] = product of all elements to the left
        output[0] = 1;
        for (int i = 1; i < n; i++) {
            output[i] = output[i - 1] * nums[i - 1];
        }

        // Pass 2: multiply by running suffix product from the right
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            output[i] *= suffix;
            suffix *= nums[i];  // extend suffix leftward for next iteration
        }

        return output;
    }
}
