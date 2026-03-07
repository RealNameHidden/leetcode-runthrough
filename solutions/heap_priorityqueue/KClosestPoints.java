package solutions.heap_priorityqueue;

import java.util.PriorityQueue;

/**
 * Find k closest points to origin using max-heap.
 * Time: O(n log k) | Space: O(k)
 *
 * Maintain heap of size k. For each point: add it, then evict max if size > k.
 * Max-heap keeps farthest point at top for quick removal.
 */
class KClosest {
    public int[][] kClosest(int[][] points, int k) {
        // Max-heap: comparator orders by distance descending
        // b first in comparator → larger distance comes first (max-heap)
        PriorityQueue<int[]> maxHeap = new PriorityQueue<>((a, b) -> {
            return (b[0]*b[0] + b[1]*b[1]) - (a[0]*a[0] + a[1]*a[1]);
        });

        // Maintain heap of size k with closest points
        for (int i = 0; i < points.length; i++) {
            maxHeap.offer(points[i]);

            // If heap exceeds k, remove the farthest point
            if (maxHeap.size() > k) {
                maxHeap.poll();  // Remove max distance point
            }
        }

        // Extract k points from heap into result array
        int[][] result = new int[k][2];

        int c = maxHeap.size() - 1;
        while (c >= 0) {
            result[c--] = maxHeap.poll();
        }
        return result;
    }
}

