/*
 * Problem: Container With Most Water
 *
 * Approach:
 * - Use two pointers from start and end
 * - Calculate area using the shorter wall as height and distance as width
 * - Move the pointer at the shorter wall inward to find a potentially taller wall
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

public class ContainerWithMostWater {
    public int maxArea(int[] height) {
    int leftPointer = 0;
    int rightPointer = height.length - 1;
    int maxWaterContained = 0;

    while (leftPointer < rightPointer) {

        int shorterWall = Math.min(height[leftPointer], height[rightPointer]);
        int widthBetweenWalls = rightPointer - leftPointer;
        int currentWaterContained = shorterWall * widthBetweenWalls;

        maxWaterContained = Math.max(maxWaterContained, currentWaterContained);

        // The shorter wall is the bottleneck — move it inward
        // to search for a taller replacement that could hold more water
        if (height[leftPointer] < height[rightPointer]) {
            leftPointer++;
        } else {
            rightPointer--;
        }
    }

    return maxWaterContained;
}
}
