/*
 * Problem: N-Queens (LeetCode 51) — Hard
 *
 * Place N queens on an N×N board so that no two queens attack each other.
 * Queens attack along the same row, column, or either diagonal.
 * Return all distinct solutions as board configurations.
 *
 * Approach — Row-by-row backtracking with three conflict sets:
 *   For each row, try every column. Skip if any of:
 *     - cols contains col          → same column already occupied
 *     - diag contains (row - col)  → same "\" diagonal (r-c is constant)
 *     - antiDiag contains (row+col)→ same "/" diagonal (r+c is constant)
 *   Place the queen, recurse to the next row, then undo (backtrack).
 *
 * Diagonal insight:
 *   All cells on a "\" diagonal share the same (r - c) value.
 *   All cells on a "/" diagonal share the same (r + c) value.
 *   → Store these differences/sums in sets for O(1) conflict checks.
 *
 * Complexity:
 *   Time:  O(N!) — at most N choices for row 0, N-1 for row 1, etc.
 *   Space: O(N)  — recursion depth + sets, plus output
 *
 * --- MEMORIZATION NOTES ---
 *
 * Three conflict sets (not a 2D board):
 *   Set<Integer> cols      → column numbers used
 *   Set<Integer> diag      → (row - col) values for "\" diagonals
 *   Set<Integer> antiDiag  → (row + col) values for "/" diagonals
 *
 * Backtrack template:
 *   place → recurse → undo
 *   (add to sets) → backtrack(row+1) → (remove from sets)
 *
 * queens[] array stores the column of the queen in each row,
 * making board construction O(N) at the end.
 */

import java.util.*;

class NQueens {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> results = new ArrayList<>();
        Set<Integer> cols     = new HashSet<>();
        Set<Integer> diag     = new HashSet<>();     // r - c constant on "\" diagonal
        Set<Integer> antiDiag = new HashSet<>();     // r + c constant on "/" diagonal
        int[] queens = new int[n];
        Arrays.fill(queens, -1);

        backtrack(0, n, queens, cols, diag, antiDiag, results);
        return results;
    }

    private void backtrack(int row, int n, int[] queens,
                           Set<Integer> cols, Set<Integer> diag, Set<Integer> antiDiag,
                           List<List<String>> results) {
        if (row == n) {
            results.add(buildBoard(queens, n));
            return;
        }
        for (int col = 0; col < n; col++) {
            if (cols.contains(col)
                    || diag.contains(row - col)
                    || antiDiag.contains(row + col)) {
                continue;
            }
            // Place
            queens[row] = col;
            cols.add(col);
            diag.add(row - col);
            antiDiag.add(row + col);

            backtrack(row + 1, n, queens, cols, diag, antiDiag, results);

            // Undo (backtrack)
            queens[row] = -1;
            cols.remove(col);
            diag.remove(row - col);
            antiDiag.remove(row + col);
        }
    }

    private List<String> buildBoard(int[] queens, int n) {
        List<String> board = new ArrayList<>();
        for (int r = 0; r < n; r++) {
            char[] row = new char[n];
            Arrays.fill(row, '.');
            row[queens[r]] = 'Q';
            board.add(new String(row));
        }
        return board;
    }
}
