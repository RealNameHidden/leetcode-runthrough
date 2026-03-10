/*
 * Problem: 121. Best Time to Buy and Sell Stock (LeetCode)
 *
 * Description:
 * You are given an array where prices[i] is the price of a stock on day i.
 * Choose one day to buy and a later day to sell, then return the maximum profit.
 * If no profit is possible, return 0.
 *
 * Approach:
 * Sliding window / running minimum:
 * - Track the cheapest price seen so far.
 * - For each day, compute the profit if we sold today.
 * - Update the best profit and the running minimum in one pass.
 *
 * Complexity:
 * - Time: O(n) - one pass through prices
 * - Space: O(1) - constant extra memory
 */

public class BestTimeToBuyAndSellStock {

    public int maxProfit(int[] prices) {
        int minPrice = prices[0];
        int bestProfit = 0;

        for (int day = 1; day < prices.length; day++) {
            int sellTodayProfit = prices[day] - minPrice;
            bestProfit = Math.max(bestProfit, sellTodayProfit);

            if (prices[day] < minPrice) {
                minPrice = prices[day];
            }
        }

        return bestProfit;
    }
}
