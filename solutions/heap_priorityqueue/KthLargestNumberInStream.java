package solutions.heap_priorityqueue;

import java.util.PriorityQueue;

class KthLargest {
    PriorityQueue<Integer> heap;
    int k = 0;
    public KthLargest(int k, int[] nums) {
        this.k = k;
        this.heap = new PriorityQueue<>((a,b)-> a-b);
        for(int n : nums){
            heapManager(n);
        }
    }
    
    public int add(int val) {
        return heapManager(val);
    }

    public int heapManager(int n){
        this.heap.offer(n);

        if(this.heap.size()>k){
            this.heap.poll();
        }
        return this.heap.peek();
    }
}

