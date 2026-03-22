/*
 * Problem: Group Anagrams (LeetCode 49)
 *
 * Given an array of strings strs, group all anagrams together and return them
 * as a list of groups. Two words are anagrams if they contain the same characters.
 * Example: ["eat","tea","tan","ate","nat","bat"]
 *       → [["eat","tea","ate"], ["tan","nat"], ["bat"]]
 *
 * Approach:
 * Sort each string's characters to produce a canonical key.
 * All anagrams share the same sorted form → use as HashMap key.
 * Append each original string to the list under that key.
 *
 * Complexity:
 * - Time:  O(n * k log k) — n words, each sorted in O(k log k) where k = max length
 * - Space: O(n * k) — storing all characters in the HashMap
 *
 * --- MEMORIZATION NOTES ---
 *
 * Canonical key via sorting:
 *   char[] chars = s.toCharArray();
 *   Arrays.sort(chars);
 *   String key = new String(chars);
 *   → "eat", "tea", "ate" all produce "aet"
 *   → DON'T use char[] as a key directly — arrays don't override equals/hashCode
 *   → Always convert back to String with new String(chars)
 *
 * computeIfAbsent one-liner:
 *   map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
 *   → If key missing: create new empty list, put it in map, return it, add s
 *   → If key present: return existing list, add s
 *   → Equivalent to:
 *       if (!map.containsKey(key)) map.put(key, new ArrayList<>());
 *       map.get(key).add(s);
 *
 * Alternative key (avoids sorting — O(k) instead of O(k log k)):
 *   int[] count = new int[26];
 *   for (char c : s.toCharArray()) count[c - 'a']++;
 *   String key = Arrays.toString(count); // "[1,0,0,...,1,0]"
 */

import java.util.*;

class GroupAnagrams {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();

        for (String s : strs) {
            // Sort characters to get canonical anagram key
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);

            // Group by sorted key
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        return new ArrayList<>(map.values());
    }
}
