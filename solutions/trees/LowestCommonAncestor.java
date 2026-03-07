/*
 * Problem: <title>
 *
 * Approach:
 * - Tree traversal (DFS/BFS)
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class LowestCommonAncestor {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if(root.val > p.val && root.val > q.val){
            return lowestCommonAncestor(root.left, p, q);
        } else if(root.val < p.val && root.val <q.val){
            return lowestCommonAncestor(root.right, p, q);
        } else {
            return root;
        }
    }
}
