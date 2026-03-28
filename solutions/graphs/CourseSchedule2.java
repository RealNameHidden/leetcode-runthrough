import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

public class CourseSchedule2 {
    // 0 = unvisited, 1 = visiting (in current DFS path), 2 = visited (fully explored)
    int[] state;

    // Adjacency list: adj[i] contains courses that depend on course i
    List<List<Integer>> adj;

    // Collects courses in reverse topological order (post-order DFS)
    List<Integer> result = new ArrayList<>();

    /**
     * Returns a valid course ordering that satisfies all prerequisites (topological sort).
     * If no valid ordering exists (cycle detected), returns an empty array.
     * @param numCourses Total number of courses (0 to numCourses-1)
     * @param prerequisites Array where [a, b] means course a requires course b first
     * @return A valid ordering of courses, or empty array if impossible
     */
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        state = new int[numCourses];
        adj = new ArrayList<>();

        // Build empty adjacency list for each course
        for (int i = 0; i < numCourses; i++)
            adj.add(new ArrayList<>());

        // Build the graph: for each [a, b], add edge b → a (b must come before a)
        for (int[] pre : prerequisites)
            adj.get(pre[1]).add(pre[0]);

        // Run DFS from each unvisited course; abort if any cycle is found
        for (int i = 0; i < numCourses; i++)
            if (state[i] == 0 && hasCycle(i))
                return new int[]{};  // cycle detected → no valid ordering

        // Result is collected in reverse post-order; reverse to get topological order
        Collections.reverse(result);
        return result.stream().mapToInt(i -> i).toArray();
    }

    /**
     * DFS with 3-state coloring for cycle detection + topological ordering.
     * Courses are added to result in post-order (after all dependents are processed).
     * @param course The course to explore
     * @return true if a cycle is detected, false otherwise
     */
    boolean hasCycle(int course) {
        // Back edge: revisiting a node in the current DFS path → cycle
        if (state[course] == 1) return true;
        // Already fully explored: skip
        if (state[course] == 2) return false;

        // Mark as visiting (in current recursion path)
        state[course] = 1;

        // Recurse into all dependent courses
        for (int neighbour : adj.get(course))
            if (hasCycle(neighbour)) return true;

        // Mark as visited and record in post-order (key difference from Course Schedule I)
        state[course] = 2;
        result.add(course);
        return false;
    }
}