package solutions.heap_priorityqueue;

import java.util.*;

/**
 * Task Scheduler: Schedule tasks with cooldown constraint.
 * Time: O(n + k log k) where k=26 | Space: O(k)
 *
 * Greedy + max-heap: always pick the most frequent available task.
 * Queue tracks tasks in cooldown with their availability time.
 */
public class TaskScheduler {
    public int leastInterval(char[] tasks, int n) {
        // Count frequency of each task
        int[] freq = new int[26];
        for (char task : tasks) {
            freq[task - 'A']++;
        }

        // Max-heap: greedily pick most frequent task
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        for (int f : freq) {
            if (f > 0) maxHeap.offer(f);
        }

        // Queue tracks tasks in cooldown: [remaining count, when available]
        Queue<int[]> cooldownQueue = new LinkedList<>();
        int time = 0;

        while (!maxHeap.isEmpty() || !cooldownQueue.isEmpty()) {
            time++;

            // Release tasks whose cooldown expired
            if (!cooldownQueue.isEmpty() && cooldownQueue.peek()[1] == time) {
                maxHeap.offer(cooldownQueue.poll()[0]);
            }

            // Pick most frequent available task
            if (!maxHeap.isEmpty()) {
                int remaining = maxHeap.poll() - 1;
                // Put back in cooldown if more executions needed
                if (remaining > 0) {
                    cooldownQueue.offer(new int[]{remaining, time + n + 1});
                }
            }
            // else: idle slot (no tasks available, but time still increments)
        }

        return time;
    }
}