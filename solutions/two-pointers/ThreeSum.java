import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/*
 * Problem: 15. 3Sum (LeetCode)
 * 
 * Description:
 * Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]] 
 * such that nums[i] + nums[j] + nums[k] == 0. No duplicate triplets in result.
 * 
 * Example:
 * Input: nums = [-1, 0, 1, 2, -1, -4]
 * Output: [[-1, -1, 2], [-1, 0, 1]]
 *
 * Approach:
 * Sort array, then use two pointers to find pairs for each element.
 * Skip duplicates to avoid duplicate triplets.
 *
 * Complexity:
 * - Time: O(n²)
 * - Space: O(1) excluding output
 */

public class ThreeSum {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();
        
        for (int i = 0; i < nums.length - 2; i++) {
            // Skip duplicate values for first element
            if (i > 0 && nums[i] == nums[i - 1]) {
                continue;
            }
            
            // Early exit if smallest remaining sum is positive
            if (nums[i] > 0) {
                break;
            }
            
            int left = i + 1;
            int right = nums.length - 1;
            
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                
                if (sum == 0) {
                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    
                    // Skip duplicates for left pointer
                    while (left < right && nums[left] == nums[left + 1]) {
                        left++;
                    }
                    // Skip duplicates for right pointer
                    while (left < right && nums[right] == nums[right - 1]) {
                        right--;
                    }
                    
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        
        return result;
    }
    
    public static void main(String[] args) {
        ThreeSum solution = new ThreeSum();
        int[] nums = {-1, 0, 1, 2, -1, -4};
        System.out.println(solution.threeSum(nums));
    }
}
