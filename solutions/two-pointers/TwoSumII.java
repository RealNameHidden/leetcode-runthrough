/*
 * Problem: Two Sum II - Input array is sorted
 *
 * Approach:
 * - Use two pointers from start and end
 * - Move pointers based on sum comparison
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

public class TwoSumII {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return new int[]{left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[]{};
    }
}
