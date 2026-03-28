import java.util.List;
import java.util.ArrayList;

public class CourseSchedule {
    // 0 = unvisited, 1 = visiting (in current recursion path), 2 = visited (path complete)
    private int[] state;

    // Adjacency list: adjList[i] contains all courses that depend on course i
    private List<List<Integer>> adjList;

    /**
     * Detects if completing all courses is possible by checking for cycles in the course dependency graph.
     * @param numCourses Total number of courses
     * @param prerequisites Array where prerequisites[i] = [a, b] means course a depends on course b
     * @return true if all courses can be finished, false if there's a circular dependency
     */
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // Initialize state tracking array for DFS cycle detection
        state = new int[numCourses];
        adjList = new ArrayList<>();

        // Build empty adjacency list for each course
        for(int o = 0; o < numCourses; o++){
            adjList.add(new ArrayList<>());
        }

        // Build the graph: for each prerequisite, add the dependent course to the prerequisite's neighbors
        for(int[] pre: prerequisites){
            adjList.get(pre[1]).add(pre[0]); // pre[0] depends on pre[1]
        }

        // Check each course for cycles using DFS
        for(int i = 0; i < adjList.size(); i++){
            if((state[i] == 0) && hasCycle(i)){
                return false; // Cycle detected, cannot complete all courses
            }
        }
        return true; // No cycles found, all courses can be completed
    }

    /**
     * DFS helper using 3-state coloring to detect cycles.
     * State 1 (visiting) in current path + revisiting = cycle detected.
     * @param course The course to check for cycles
     * @return true if a cycle exists in this DFS path, false otherwise
     */
    public boolean hasCycle(int course){
        // If currently visiting, we've found a back edge (cycle)
        if(state[course] == 1){
            return true;
        }
        // If already completed, no cycle from this path
        if(state[course] == 2){
            return false;
        }

        // Mark as visiting (in current recursion path)
        state[course] = 1;

        // Recursively check all courses that depend on this course
        List<Integer> neighbours = adjList.get(course);
        for(Integer neighbour: neighbours){
            if(hasCycle(neighbour)){
                return true;
            }
        }

        // Mark as visited (all descendants checked, no cycles)
        state[course] = 2;
        return false;
    }
}
