/*
 * LeetCode 78 — Subsets
 *
 * Given an integer array nums of unique elements, return all possible subsets (the power set).
 * The solution set must not contain duplicate subsets. Return the solution in any order.
 *
 * Approach: Backtracking — at each index, either include nums[i] or skip it.
 *
 * Complexity:
 *   Time:  O(n * 2^n) — 2^n subsets, each built in O(n)
 *   Space: O(n) — recursion stack depth
 */

import java.util.ArrayList;
import java.util.List;

class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        List<Integer> path = new ArrayList<>();
        backtrack(nums, 0, path, result);
        return result;
    }

    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {
        // Every path (at any depth) is a valid subset — add it
        result.add(new ArrayList<>(path));

        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);           // include
            backtrack(nums, i + 1, path, result);
            path.remove(path.size() - 1); // exclude (backtrack)
        }
    }
}
