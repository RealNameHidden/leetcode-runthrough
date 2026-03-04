/**
 * Trapping Rain Water - LeetCode Problem
 *
 * PROBLEM:
 * Given an array of integers representing elevation map where each element is a bar,
 * calculate how much water can be trapped between the bars after it rains.
 *
 * Example: [0,1,0,2,1,0,1,3,2,1,2,1]
 * Visual:
 *       |
 *   |___|___
 * | | | | |_|
 * The trapped water (shown as ~) is 6 units.
 *
 * KEY INSIGHT:
 * The water trapped at position i is determined by:
 * min(maxHeightLeft, maxHeightRight) - height[i]
 *
 * We use TWO POINTERS to efficiently find this without extra space.
 */

public class TrappingRainWater {

    /**
     * Two-pointer approach - O(n) time, O(1) space
     *
     * ALGORITHM:
     * 1. Start with pointers at both ends of the array
     * 2. Keep track of the maximum height seen so far from left and right
     * 3. Move the pointer pointing to the smaller height inward
     * 4. At each step, calculate water trapped at current position
     *
     * WHY THIS WORKS:
     * - Water at a position is limited by the shorter of the two walls
     * - If we're at the shorter side, we can safely calculate trapped water
     *   because the taller side on the opposite end guarantees water won't overflow
     */
    public int trap(int[] height) {
        // Edge case: need at least 3 bars to trap water
        if (height == null || height.length < 3) {
            return 0;
        }

        int left = 0;                          // Left pointer starting from beginning
        int right = height.length - 1;         // Right pointer starting from end
        int leftMax = 0;                       // Maximum height seen from left
        int rightMax = 0;                      // Maximum height seen from right
        int totalWater = 0;                    // Total water trapped

        // Keep moving pointers until they meet
        while (left < right) {
            // If left height is smaller or equal, process from left side
            if (height[left] <= height[right]) {
                // If current height is taller than leftMax, update leftMax
                if (height[left] >= leftMax) {
                    leftMax = height[left];
                }
                // Otherwise, water is trapped = distance from current height to leftMax
                else {
                    totalWater += leftMax - height[left];
                }
                left++;  // Move left pointer inward
            }
            // Otherwise, process from right side
            else {
                // If current height is taller than rightMax, update rightMax
                if (height[right] >= rightMax) {
                    rightMax = height[right];
                }
                // Otherwise, water is trapped = distance from current height to rightMax
                else {
                    totalWater += rightMax - height[right];
                }
                right--;  // Move right pointer inward
            }
        }

        return totalWater;
    }
}
