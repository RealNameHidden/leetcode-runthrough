/*
 * Problem: 53. Maximum Subarray (LeetCode)
 *
 * Description:
 * Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.
 *
 * Example:
 * Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
 * Output: 6
 * Explanation: The subarray [4, -1, 2, 1] has the largest sum = 6
 *
 * Approach:
 * Kadane's Algorithm - Use dynamic programming to track the maximum sum ending at each position
 *
 * Complexity:
 * - Time: O(n) - single pass through array
 * - Space: O(1) - only using two variables
 */

public class MaxSubArray {
    
    public int maxSubArray(int[] nums) {
        // globalMax tracks the best sum we've found so far across entire array
        int globalMax = nums[0];
        
        // currentMax tracks the best sum we can get if we MUST include the current element
        int currentMax = nums[0];

        // Iterate from second element onwards
        for (int i = 1; i < nums.length; i++) {
            // At each position, decide: should we extend the previous subarray or start fresh?
            // If adding current number to previous sum is negative, better to start fresh with just current number
            currentMax = Math.max(nums[i], currentMax + nums[i]);
            
            // Update global max if we found a better sum
            if (currentMax > globalMax) {
                globalMax = currentMax;
            }
        }

        return globalMax;
    }
    
    public static void main(String[] args) {
        MaxSubArray solution = new MaxSubArray();
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println("Maximum subarray sum: " + solution.maxSubArray(nums));
    }
}

/*
 * ============================================================================
 * KADANE'S ALGORITHM EXPLAINED FOR A 5-YEAR-OLD
 * ============================================================================
 * 
 * Imagine you're walking through a candy store collecting candies into a basket.
 * 
 * THE PROBLEM:
 * You walk past some sections with LOTS of candies (good sections) and some 
 * with just wrappers on the floor (bad sections with negative candies).
 * You can only pick ONE continuous path through the store, and you want the 
 * path where you collect the MOST candies.
 * 
 * HOW KADANE'S WORKS (The Simple Way):
 * 
 * Think of "currentMax" as your basket RIGHT NOW. At each store section, you ask:
 * 
 *   "Should I keep what's in my basket AND pick up from this section?
 *    OR should I throw everything away and start fresh with just this section?"
 * 
 * If my basket is heavy with good candies, I keep it and add more.
 * If my basket is full of wrappers (negative), I throw it out and start new.
 * 
 * And "globalMax" is like taking a PHOTO of your best basket ever. Every time 
 * you find a better basket, you take a new photo to remember it.
 * 
 * EXAMPLE WALK:
 * Store sections: [-2, 1, -3, 4, -1, 2, 1, -5, 4]
 * 
 * Section 1 (-2): Start with -2 candies. Photo: -2 is best so far
 * Section 2 (1):  -2 + 1 = -1, OR just take 1? Take 1! Photo: 1 is best
 * Section 3 (-3): 1 + (-3) = -2, OR just take -3? Take -2. Photo: still 1
 * Section 4 (4):  -2 + 4 = 2, it's positive so keep going. Photo: 2 is best? No wait...
 * Section 5 (-1): 2 + (-1) = 1, keep it. Photo: still good
 * Section 6 (2):  1 + 2 = 3. Photo: 3 is best
 * Section 7 (1):  3 + 1 = 4. Photo: 4 is best
 * Section 8 (-5): 4 + (-5) = -1, throw it away, start with -1. Photo: still 4
 * Section 9 (4):  -1 + 4 = 3, OR start with 4? Start with 4! Photo: still 4
 * 
 * ANSWER: The best path was sections 4-7 = [4, -1, 2, 1] = 6 total candies!
 * Wait that's 6 not 4, let me recalculate... yes 4-1+2+1 = 6!
 * 
 * THE KEY INSIGHT:
 * At each step, we only care about TWO things:
 * 1. The best sum we have IF we must include the current element
 * 2. The best sum we've EVER seen (could be in the past)
 * 
 * We don't need to remember ALL past subarrays - just these two numbers!
 * That's why it's so fast and uses barely any memory.
 * 
 * ============================================================================
 */

