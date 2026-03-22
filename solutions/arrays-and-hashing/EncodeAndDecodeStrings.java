/*
 * Problem: Encode and Decode Strings (LeetCode 271 — Premium)
 *
 * Design an algorithm to encode a list of strings to a single string, then
 * decode that string back to the original list. Strings may contain ANY character.
 *
 * Approach: Length-prefix encoding — format each token as "{length}#{string}"
 *   encode(["lint","code","love"]) → "4#lint4#code4#love"
 *   decode("4#lint4#code4#love")  → ["lint","code","love"]
 *
 * Why not a simple delimiter?
 *   Strings can contain any character, including whatever delimiter you pick.
 *   "a,b" joined with "," → "a,b" → decode sees 2 strings, not 1.
 *   Length-prefix sidesteps this: we always read EXACTLY {length} chars after '#'.
 *
 * Complexity:
 * - Time:  O(n * k) for both encode and decode — each character touched once
 * - Space: O(n * k) — encoded string holds all characters plus length prefixes
 *
 * --- MEMORIZATION NOTES ---
 *
 * Encode pattern:
 *   sb.append(s.length()).append('#').append(s)
 *   → Prepend the decimal length and '#' before each string
 *   → Works for empty strings too: "" → "0#"
 *
 * Decode loop (two-pointer):
 *   int i = 0;
 *   while (i < s.length()) {
 *     int j = s.indexOf('#', i);           // find length/content separator
 *     int len = Integer.parseInt(s.substring(i, j)); // parse length
 *     result.add(s.substring(j + 1, j + 1 + len));   // read exact len chars
 *     i = j + 1 + len;                    // advance past this token
 *   }
 *
 * Why indexOf('#', i) is safe:
 *   At position i, the string always starts with decimal digits then '#'.
 *   Digits contain no '#', so indexOf finds the length/content '#', not any '#'
 *   buried in the content of a previous string.
 *
 * Analogy: HTTP Content-Length header works the same way — exact byte count
 * tells the receiver precisely how much to read, regardless of content.
 */

import java.util.*;

class EncodeAndDecodeStrings {

    public String encode(List<String> strs) {
        StringBuilder sb = new StringBuilder();
        for (String s : strs) {
            sb.append(s.length()).append('#').append(s);
        }
        return sb.toString();
    }

    public List<String> decode(String s) {
        List<String> result = new ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            int j = s.indexOf('#', i);                      // delimiter position
            int len = Integer.parseInt(s.substring(i, j));  // string length
            result.add(s.substring(j + 1, j + 1 + len));   // exact content
            i = j + 1 + len;                                // next token start
        }
        return result;
    }
}
