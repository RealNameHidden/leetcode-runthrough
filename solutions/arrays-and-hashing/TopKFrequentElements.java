/*
 * Problem: Top K Frequent Elements (LeetCode 347)
 *
 * Given an integer array nums and an integer k, return the k most frequent elements.
 * You may return the answer in any order.
 * Example: nums = [1,1,1,2,2,3], k = 2 → [1,2]
 *
 * Approach:
 * 1. Count frequencies using a HashMap
 * 2. Use a min-heap of size k (ordered by frequency)
 * 3. Slide through all unique numbers — evict the least frequent when heap exceeds k
 * 4. What remains in the heap are the top k frequent elements
 *
 * Complexity:
 * - Time: O(n log k)
 * - Space: O(n)
 *
 * --- MEMORIZATION NOTES ---
 *
 * HashMap merge:
 *   freqMap.merge(key, 1, Integer::sum)
 *   → if key absent: put(key, 1)
 *   → if key present: put(key, oldValue + 1)
 *   Think of it as: "add 1, or start at 1"
 *
 * PriorityQueue (min-heap by frequency):
 *   PriorityQueue<Integer> heap = new PriorityQueue<>(
 *       (a, b) -> freqMap.get(a) - freqMap.get(b)
 *   );
 *   → comparator (a, b) -> a - b means a comes first if smaller → min-heap
 *   → here "smaller" = lower frequency, so least frequent is always at top (root)
 *   → poll() evicts the least frequent, keeping only the top k survivors
 */

import java.util.HashMap;
import java.util.PriorityQueue;

class TopKFrequentElements {
    public int[] topKFrequent(int[] nums, int k) {
        HashMap<Integer, Integer> freqMap = new HashMap<>();
        for (int num : nums) {
            freqMap.merge(num, 1, Integer::sum);
        }
        
        // Min-heap of size k by frequency
        PriorityQueue<Integer> heap = new PriorityQueue<>(
            (a, b) -> freqMap.get(a) - freqMap.get(b)
        );
        
        for (int num : freqMap.keySet()) {
            heap.offer(num);
            if (heap.size() > k) {
                heap.poll();
            }
        }
        
        int[] result = new int[k];
        int i = k - 1;
        while (!heap.isEmpty()) {
            result[i--] = heap.poll();
        }
        
        return result;
    }
}