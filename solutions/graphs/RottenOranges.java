import java.util.LinkedList;
import java.util.Queue;

public class RottenOranges {
    public int orangesRotting(int[][] grid) {
        
        Queue<int[]> queue = new LinkedList<>();
        int freshOranges = 0;
        int rows = grid.length, col = grid[0].length;
        for(int i=0; i<rows; i++){
            for(int j=0; j<col; j++){
                if (grid[i][j] == 1) freshOranges++;
                else if (grid[i][j] == 2) queue.offer(new int[]{i,j});

            }
        }

        if(freshOranges==0){
            return 0;
        }

        int minutes = 0;
        while(!queue.isEmpty() && freshOranges > 0){
            minutes++;
            int size = queue.size();
            for(int p = 0; p<size; p++){
                
                int[] curr = queue.poll(); 
                int r = curr[0];
                int c = curr[1];
                int[][] directions = {
                    {r+1,c},
                    {r-1,c},
                    {r, c+1},
                    {r, c-1}
                };
                for(int[] direction: directions){
                    int nr = direction[0];
                    int nc = direction[1];

                    if(nr>=0 && nr<rows && nc>=0 && nc<col && grid[nr][nc]==1){
                        grid[nr][nc]=2;
                        freshOranges--;
                        queue.offer(new int[]{nr,nc});
                    }
                }
            }

        }

        int result = ((freshOranges == 0) ? minutes : -1);
        return result;

    }
}
