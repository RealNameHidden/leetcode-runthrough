/*
 * LeetCode 79 — Word Search
 *
 * Given an m x n grid of characters board and a string word, return true if word
 * can be constructed from letters of sequentially adjacent cells (horizontally or
 * vertically). The same cell may not be used more than once.
 *
 * Approach: Backtracking DFS — try each cell as a start if it matches word[0];
 * mark visited in-place with '#', explore four directions, then restore.
 *
 * Complexity:
 *   Time:  O(m * n * 3^L) — L = word length; first step has up to 4 neighbors, then 3
 *   Space: O(L) — recursion depth
 */

public class WordSearch {
    public boolean exist(char[][] board, String word) {
        int m = board.length;
        int n = board[0].length;

        // Any cell matching the first letter can be the start of a path
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (word.charAt(0) == board[i][j] && search(i, j, board, word, 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean search(int r, int c, char[][] board, String word, int index) {
        // Matched every character
        if (index == word.length()) {
            return true;
        }

        // Out of bounds, already visited ('#'), or letter mismatch
        if (r < 0 || c < 0 || r >= board.length || c >= board[0].length
                || board[r][c] != word.charAt(index)) {
            return false;
        }

        // Mark visited so we cannot reuse this cell on the current path
        char temp = board[r][c];
        board[r][c] = '#';
        int[][] directions = new int[][] { { -1, 0 }, { 0, -1 }, { 1, 0 }, { 0, 1 } };

        for (int[] d : directions) {
            if (search(r + d[0], c + d[1], board, word, index + 1)) {
                return true; // success: leave markers (caller returns immediately)
            }
        }

        // Backtrack: restore cell for other paths / other start positions
        board[r][c] = temp;
        return false;
    }
}
