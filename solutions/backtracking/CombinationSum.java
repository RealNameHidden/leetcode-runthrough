/*
 * LeetCode 39 — Combination Sum
 *
 * Given an array of distinct integers candidates and a target, return all unique
 * combinations where the chosen numbers sum to target. The same number may be
 * chosen from candidates an unlimited number of times.
 *
 * Approach: Backtracking — try each candidate from startIdx; recurse with same
 * index to allow reuse; prune when currentSum > target.
 *
 * Complexity:
 *   Time:  O(N^(T/M + 1)) — N candidates, T target, M min(candidates)
 *   Space: O(T/M) — recursion depth
 */

import java.util.ArrayList;
import java.util.List;

class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result, 0);
        return result;
    }

    private void backtrack(
        int[] candidates,
        int target,
        int currentSum,
        List<Integer> combination,
        List<List<Integer>> result,
        int startIdx
    ) {
        // Base case: found a valid combination
        if (currentSum == target) {
            result.add(new ArrayList<>(combination));
            return;
        }

        // Prune: exceeded target
        if (currentSum > target) {
            return;
        }

        // Try each candidate starting from startIdx
        for (int i = startIdx; i < candidates.length; i++) {
            int num = candidates[i];

            // Choose: add this number
            combination.add(num);

            // Explore: recurse with the SAME index (allow reuse)
            backtrack(candidates, target, currentSum + num, combination, result, i);

            // Unchoose: backtrack
            combination.remove(combination.size() - 1);
        }
    }
}
