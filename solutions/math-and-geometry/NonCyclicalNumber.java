/*
 * LeetCode 202 — Happy Number
 *
 * A happy number is a positive integer where repeated replacement of the number
 * by the sum of the squares of its digits eventually reaches 1. If it loops
 * without hitting 1, it is unhappy.
 *
 * Approach: Track each value seen in a HashSet; if we repeat a value, we're in
 * a cycle that is not the singleton {1}, so return false. If we reach 1, true.
 *
 * Complexity:
 *   Time:  O(log n) per transformation × O(k) steps — k is bounded for 32-bit inputs
 *   Space: O(k) — size of the visited set
 */

import java.util.HashSet;
import java.util.Set;

public class NonCyclicalNumber {

    public boolean isHappy(int n) {
        Set<Integer> visit = new HashSet<>();

        while (!visit.contains(n)) {
            visit.add(n);
            n = sumOfSquares(n);
            if (n == 1) {
                return true;
            }
        }
        return false;
    }

    private int sumOfSquares(int n) {
        int output = 0;

        while (n > 0) {
            int digit = n % 10;
            digit = digit * digit;
            output += digit;
            n /= 10;
        }
        return output;
    }
}
