/*
 * Problem: Valid Sudoku (LeetCode 36)
 *
 * Determine if a 9x9 Sudoku board is valid. Only the filled cells need to be validated
 * according to the following rules:
 *   1. Each row must contain digits 1-9 with no repetition.
 *   2. Each column must contain digits 1-9 with no repetition.
 *   3. Each of the nine 3x3 sub-boxes must contain digits 1-9 with no repetition.
 *
 * Approach: One-pass with a single HashSet using encoded keys
 * For each non-'.' cell at (r, c) with value val:
 *   - Encode row membership:  "r" + r + val
 *   - Encode col membership:  "c" + c + val
 *   - Encode box membership:  "b" + boxIndex + val  where boxIndex = (r/3)*3 + c/3
 *   - If any encoding already exists in the set → duplicate → return false
 *
 * Complexity:
 * - Time:  O(81) = O(1) — fixed 9×9 grid
 * - Space: O(81) = O(1) — at most 81*3 = 243 strings in the set
 *
 * --- MEMORIZATION NOTES ---
 *
 * Box index formula: (row / 3) * 3 + (col / 3)
 *   Top-left box    (rows 0-2, cols 0-2) → index 0
 *   Top-center box  (rows 0-2, cols 3-5) → index 1
 *   ...
 *   Bottom-right box (rows 6-8, cols 6-8) → index 8
 *
 * Encoding trick: prefix each key with 'r', 'c', or 'b' to avoid collisions
 *   "r0 5" in row 0 vs "c0 5" in col 0 are different keys
 *
 * Alternative: Use 27 separate HashSets (9 rows + 9 cols + 9 boxes)
 */

import java.util.HashSet;

class ValidSudoku {
    public boolean isValidSudoku(char[][] board) {
        HashSet<String> seen = new HashSet<>();

        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                char val = board[r][c];
                if (val == '.') continue;

                int boxIdx = (r / 3) * 3 + (c / 3);

                // Encode membership as unique strings
                String rowKey = "r" + r + val;
                String colKey = "c" + c + val;
                String boxKey = "b" + boxIdx + val;

                // HashSet.add returns false if already present → duplicate found
                if (!seen.add(rowKey) || !seen.add(colKey) || !seen.add(boxKey)) {
                    return false;
                }
            }
        }

        return true;
    }
}
