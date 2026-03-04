package solutions.heap_priorityqueue;

import java.util.PriorityQueue;

class LastStone {
    public int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> heap = new PriorityQueue<>((a,b)->{
          return  b-a;
        });

        for(int stone : stones){
            heap.offer(stone);
        }

        while(!heap.isEmpty()){
            if(heap.size()==1){
                return heap.poll();
            }

            int x= heap.poll();
            int y= heap.poll();

            if(x==y){
                continue;
            } else if(y<x){
                x = x-y;
                heap.offer(x);
            }

        }
        return 0;

    }
}
