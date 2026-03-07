/*
 * Problem: Count Good Nodes in Binary Tree
 *
 * Approach:
 * - Tree traversal (DFS)
 * - Track the maximum value seen from root to current node
 * - A good node is one where its value >= max value from root to it
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */

class CountGoodNodes {
    public int goodNodes(TreeNode root) {
        if(root==null){
            return 0;
        }

        int maxVal = root.val;
        int count = 0;

        return dfs(root, maxVal, count);

    }

    private int dfs(TreeNode root, int maxVal, int count){

        if(root==null){
            return count;
        }
        maxVal = Math.max(maxVal,root.val);
        if(root.val<maxVal){
            count = count + 0;
        } else {
            count = count + 1;
        }
        count = dfs(root.left, maxVal, count);
        count = dfs(root.right, maxVal, count);
        return count;
    }
}
