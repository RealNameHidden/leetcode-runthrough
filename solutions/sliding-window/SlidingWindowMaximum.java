import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class SlidingWindowMaximum {
    public int[] maxSlidingWindow(int[] nums, int k) {
        if (nums == null || nums.length == 0) return new int[0];

        List<Integer> result = new ArrayList<>();

        // Deque stores INDICES, not values
        Deque<Integer> dq = new ArrayDeque<>();

        for (int i = 0; i < nums.length; i++) {
            // 1. Remove indices that are out of the window boundary
            if (!dq.isEmpty() && dq.peekFirst() == i - k) {
                dq.pollFirst();
            }

            // 2. Remove indices of elements smaller than current (they'll never be max)
            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) {
                dq.pollLast();
            }

            // 3. Add current element's index to the back
            dq.offerLast(i);

            // 4. Once we've hit window size k, start recording the max
            if (i >= k - 1) {
                result.add(nums[dq.peekFirst()]);
            }
        }

        return result.stream().mapToInt(Integer::intValue).toArray();
    }
}