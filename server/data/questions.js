const questions = [
  {
    id: 1,
    text: 'What is the time complexity of binary search?',
    options: [
      { id: 'A', text: 'O(n)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n log n)' },
      { id: 'D', text: 'O(1)' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 2,
    text: 'Which data structure uses LIFO (Last In, First Out) ordering?',
    options: [
      { id: 'A', text: 'Queue' },
      { id: 'B', text: 'Array' },
      { id: 'C', text: 'Stack' },
      { id: 'D', text: 'Linked List' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 3,
    text: 'What is the worst-case time complexity of quicksort?',
    options: [
      { id: 'A', text: 'O(n log n)' },
      { id: 'B', text: 'O(n)' },
      { id: 'C', text: 'O(log n)' },
      { id: 'D', text: 'O(n^2)' },
    ],
    correctAnswer: 'D',
  },
  {
    id: 4,
    text: 'Which tree traversal visits the root node first?',
    options: [
      { id: 'A', text: 'In-order' },
      { id: 'B', text: 'Pre-order' },
      { id: 'C', text: 'Post-order' },
      { id: 'D', text: 'Level-order' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 5,
    text: 'What is the space complexity of merge sort?',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n^2)' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 6,
    text: 'Which data structure is used for Breadth-First Search (BFS)?',
    options: [
      { id: 'A', text: 'Stack' },
      { id: 'B', text: 'Queue' },
      { id: 'C', text: 'Heap' },
      { id: 'D', text: 'Deque' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 7,
    text: 'Which of the following is a self-balancing Binary Search Tree?',
    options: [
      { id: 'A', text: 'Binary Heap' },
      { id: 'B', text: 'B-Tree' },
      { id: 'C', text: 'AVL Tree' },
      { id: 'D', text: 'Trie' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 8,
    text: 'What is the time complexity of inserting a node at the beginning of a singly linked list?',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(n)' },
      { id: 'C', text: 'O(log n)' },
      { id: 'D', text: 'O(n^2)' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 9,
    text: 'Which of these sorting algorithms is stable?',
    options: [
      { id: 'A', text: 'Quick Sort' },
      { id: 'B', text: 'Heap Sort' },
      { id: 'C', text: 'Selection Sort' },
      { id: 'D', text: 'Merge Sort' },
    ],
    correctAnswer: 'D',
  },
  {
    id: 10,
    text: 'What does Depth-First Search (DFS) use internally for traversal?',
    options: [
      { id: 'A', text: 'Queue' },
      { id: 'B', text: 'Stack' },
      { id: 'C', text: 'Priority Queue' },
      { id: 'D', text: 'Hash Map' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 11,
    text: 'What is the maximum number of nodes at level L in a binary tree?',
    options: [
      { id: 'A', text: '2L' },
      { id: 'B', text: 'L^2' },
      { id: 'C', text: '2^L' },
      { id: 'D', text: 'L + 1' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 12,
    text: 'What is the average time complexity of a hash table lookup?',
    options: [
      { id: 'A', text: 'O(n)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n log n)' },
      { id: 'D', text: 'O(1)' },
    ],
    correctAnswer: 'D',
  },
  {
    id: 13,
    text: 'Which of the following is NOT a greedy algorithm?',
    options: [
      { id: 'A', text: "Dijkstra's Algorithm" },
      { id: 'B', text: "Kruskal's Algorithm" },
      { id: 'C', text: 'Bellman-Ford Algorithm' },
      { id: 'D', text: "Prim's Algorithm" },
    ],
    correctAnswer: 'C',
  },
  {
    id: 14,
    text: 'Which algorithm is used to find the Minimum Spanning Tree of a graph?',
    options: [
      { id: 'A', text: "Floyd-Warshall's Algorithm" },
      { id: 'B', text: "Dijkstra's Algorithm" },
      { id: 'C', text: "Kruskal's Algorithm" },
      { id: 'D', text: 'Bellman-Ford Algorithm' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 15,
    text: 'What is the height of a complete binary tree with n nodes?',
    options: [
      { id: 'A', text: 'n' },
      { id: 'B', text: 'n/2' },
      { id: 'C', text: 'log n' },
      { id: 'D', text: 'sqrt(n)' },
    ],
    correctAnswer: 'C',
  },
];

module.exports = questions;
