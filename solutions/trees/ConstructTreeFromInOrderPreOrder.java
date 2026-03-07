import java.util.HashMap;
import java.util.Map;

public class ConstructTreeFromInOrderPreOrder {
    int preIdx = 0;
    Map<Integer, Integer> inorderMap = new HashMap<>();

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++)
            inorderMap.put(inorder[i], i);
        return build(preorder, 0, preorder.length - 1);
    }

    private TreeNode build(int[] preorder, int inStart, int inEnd) {
        if (inStart > inEnd) return null;          // no nodes in this region

        int rootVal = preorder[preIdx++];          // next preorder val = root
        TreeNode root = new TreeNode(rootVal);
        int mid = inorderMap.get(rootVal);         // find it in inorder

        root.left  = build(preorder, inStart, mid - 1);  // left of mid
        root.right = build(preorder, mid + 1, inEnd);    // right of mid
        return root;
    }
}
