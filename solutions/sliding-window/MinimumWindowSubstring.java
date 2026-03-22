import java.util.HashMap;
import java.util.Map;

public class MinimumWindowSubstring {
    public String minWindow(String s, String t) {
        if (s == null || t == null || s.length() == 0 || t.length() == 0) return "";

        // Count needed characters from t
        Map<Character, Integer> need = new HashMap<>();
        for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);

        int required = need.size(); // distinct chars we need to satisfy
        int formed   = 0;           // distinct chars currently satisfied in window

        Map<Character, Integer> window = new HashMap<>();

        int left = 0;
        int minLen = Integer.MAX_VALUE;
        int minL = 0, minR = 0;

        for (int right = 0; right < s.length(); right++) {
            // Expand right
            char c = s.charAt(right);
            window.merge(c, 1, Integer::sum);

            // Check if this char's count now satisfies the requirement
            if (need.containsKey(c) && window.get(c).intValue() == need.get(c).intValue()) {
                formed++;
            }

            // Try to contract from left while window is valid
            while (left <= right && formed == required) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    minL = left;
                    minR = right;
                }

                char leftChar = s.charAt(left);
                window.merge(leftChar, -1, Integer::sum);
                if (need.containsKey(leftChar) && window.get(leftChar) < need.get(leftChar)) {
                    formed--;
                }
                left++;
            }
        }

        return minLen == Integer.MAX_VALUE ? "" : s.substring(minL, minR + 1);
    }
}
