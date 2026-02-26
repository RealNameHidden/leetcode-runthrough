/*
 * Problem: 55. Jump Game (LeetCode)
 *
 * Description:
 * You are given an integer array nums where you are initially positioned at the first index.
 * Each element in the array represents your maximum jump length from that position.
 * Determine if you can reach the last index of the array.
 *
 * Example 1:
 * Input: nums = [2, 3, 1, 1, 4]
 * Output: true
 * Explanation: Jump 1 step from index 0 to 1, then 3 steps to last index.
 *
 * Example 2:
 * Input: nums = [3, 2, 1, 0, 4]
 * Output: false
 * Explanation: Always reach index 3, max jump is 0. Can't reach last index.
 *
 * Approach:
 * Use greedy algorithm to track the farthest index we can reach.
 * At each position, update the farthest reachable index.
 * If we can reach the last index before running out of positions, return true.
 *
 * Complexity:
 * - Time: O(n) - single pass through array
 * - Space: O(1) - only using one variable
 */

public class Jump {
    
    public boolean canJump(int[] nums) {
        // maxReach tracks the farthest index we can possibly reach
        int maxReach = 0;

        for (int i = 0; i < nums.length; i++) {
            // If current index is beyond our reach, we can't proceed
            if (i > maxReach) {
                return false;
            }

            // Update the farthest index we can reach from current position
            // From position i, we can jump up to nums[i] steps, reaching index i + nums[i]
            maxReach = Math.max(maxReach, i + nums[i]);

            // Early exit: if we can reach the last index, return true immediately
            if (maxReach >= nums.length - 1) {
                return true;
            }
        }

        return true;
    }
    
    public static void main(String[] args) {
        Jump solution = new Jump();
        
        int[] test1 = {2, 3, 1, 1, 4};
        System.out.println("Test 1: " + solution.canJump(test1)); // true
        
        int[] test2 = {3, 2, 1, 0, 4};
        System.out.println("Test 2: " + solution.canJump(test2)); // false
    }
}

/*
 * ============================================================================
 * GREEDY APPROACH EXPLANATION
 * ============================================================================
 * 
 * WHY GREEDY WORKS HERE:
 * 
 * At each step, we DON'T need to decide "which jump should I take?"
 * Instead, we just ask: "What's the FARTHEST I can possibly reach?"
 * 
 * The greedy choice is: always try to reach as far as possible.
 * This is optimal because:
 * - If we can reach index X from here, we should always try to reach X
 * - Reaching X gives us more options for the next jump
 * - There's no benefit to jumping shorter
 * 
 * THE ALGORITHM:
 * 
 * Walk through each position from left to right:
 * 1. Check: Can we even reach this position? If i > maxReach, NO
 * 2. Update: From this position, how far can we reach? maxReach = max(maxReach, i + nums[i])
 * 3. Win condition: If maxReach >= last index, we won!
 * 
 * EXAMPLE WALKTHROUGH:
 * nums = [2, 3, 1, 1, 4]
 * 
 * Start: maxReach = 0 (can only reach index 0)
 * 
 * i=0, value=2: Can reach index 0? YES (0 <= 0)
 *               From here, max reach = max(0, 0+2) = 2
 *               Can reach end? NO (2 < 4)
 * 
 * i=1, value=3: Can reach index 1? YES (1 <= 2)
 *               From here, max reach = max(2, 1+3) = 4
 *               Can reach end? YES (4 >= 4)
 *               RETURN TRUE!
 * 
 * WHY IT'S GREEDY:
 * We're always taking the "locally optimal" choice (reaching as far as possible)
 * and it leads to a "globally optimal" solution (reaching the end if possible).
 * We never need to backtrack or reconsider previous choices.
 * 
 * ============================================================================
 */
