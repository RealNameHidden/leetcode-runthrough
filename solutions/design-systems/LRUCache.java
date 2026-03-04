/*
 * Problem: LRU Cache Design
 *
 * Approach:
 * - Use a doubly-linked list to maintain insertion order (MRU at head, LRU at tail)
 * - Use a hash map for O(1) lookups
 * - On access, move node to front (most recently used)
 * - On capacity overflow, evict the tail node (least recently used)
 *
 * Complexity:
 * - get(key): O(1) - HashMap lookup + list operations
 * - put(key, val): O(1) - HashMap operations + list operations
 * - Space: O(capacity)
 */

import java.util.HashMap;
import java.util.Map;

class LRUCache {
    // Node in doubly-linked list
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private Map<Integer, Node> map = new HashMap<>(); // Key to node mapping for O(1) access
    private int capacity;
    private Node head = new Node(0,0); // Dummy sentinel pointing to MRU (most recently used)
    private Node tail = new Node(0,0); // Dummy sentinel pointing to LRU (least recently used)

    // Initialize the cache with given capacity and link sentinel nodes
    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail; // Connect head to tail
        tail.prev = head; // Connect tail to head
    }

    // Retrieve value by key; returns -1 if not found
    // Marks accessed node as most recently used
    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node); // Remove from current position
        insertFront(node); // Move to front (MRU)
        return node.val;
    }

    // Insert or update key-value pair
    // If key exists, update value; if not, add new node
    // If capacity exceeded, evict least recently used node
    public void put(int key, int val) {
        if (map.containsKey(key)) remove(map.get(key)); // Remove old entry if exists
        Node node = new Node(key, val);
        insertFront(node); // Insert as most recently used
        map.put(key, node);
        if (map.size() > capacity) {
            Node lru = tail.prev; // Get least recently used node
            remove(lru);
            map.remove(lru.key);
        }
    }

    // Remove node from doubly-linked list
    private void remove(Node n) {
        n.prev.next = n.next;
        n.next.prev = n.prev;
    }

    // Insert node right after head (as most recently used)
    private void insertFront(Node n) {
        n.next = head.next;
        n.prev = head;
        head.next.prev = n;
        head.next = n;
    }
}