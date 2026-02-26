/*
 * Problem: 200. Number of Islands (LeetCode)
 *
 * Description:
 * Given an m x n 2D binary grid representing a map of '1's (land) and '0's (water),
 * return the number of islands. An island is surrounded by water and formed by connecting
 * adjacent lands horizontally or vertically (not diagonally).
 *
 * Example:
 * Input: grid = [
 *   ["1","1","1","1","0"],
 *   ["1","1","0","1","0"],
 *   ["1","1","0","0","0"],
 *   ["0","0","0","0","0"]
 * ]
 * Output: 1
 *
 * Approach:
 * Use DFS to traverse each island. When we find a '1', increment island count and mark
 * all connected '1's as '0' (visited) using depth-first search.
 *
 * Complexity:
 * - Time: O(m × n) - visit each cell once
 * - Space: O(m × n) - recursion stack in worst case
 */

class NumberOfIslands {
    public int numIslands(char[][] grid) {
        if(grid==null){
            return 0;
        }
        int count=0;
        for(int i=0; i<grid.length; i++){
            for(int j=0; j<grid[0].length; j++){
                if(grid[i][j] == '1'){
                count=count+1;
                dfs(i,j,grid);  
                }
            }
        }
        return count;
    }

    private void dfs(int i, int j, char[][] grid){
        if(i<0 || i>=grid.length || j<0 || j>=grid[0].length || grid[i][j]=='0'){
            return;
        }

        grid[i][j]='0';

        // IMPORTANT: Use i+1, i-1, j+1, j-1 NOT i++, i--, j++, j--
        // Using ++ or -- would mutate i and j, breaking the recursive calls
        dfs(i-1, j, grid);
        dfs(i+1, j, grid);
        dfs(i, j+1, grid);
        dfs(i, j-1, grid);
        return;
    }
}
