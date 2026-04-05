import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Tag } from '../tags/tag.entity';
import { Problem, Difficulty, Status } from '../problems/problem.entity';

const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'leetcode-tracker.sqlite',
  entities: [Category, Tag, Problem],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();

  const categoryRepo = AppDataSource.getRepository(Category);
  const tagRepo = AppDataSource.getRepository(Tag);
  const problemRepo = AppDataSource.getRepository(Problem);

  const existingCount = await categoryRepo.count();
  if (existingCount > 0) {
    console.log('Database already has data, skipping seed.');
    await AppDataSource.destroy();
    return;
  }

  // Categories
  const categoryNames = [
    'Arrays',
    'Strings',
    'Trees',
    'Graphs',
    'Dynamic Programming',
    'Binary Search',
  ];
  const categories = await categoryRepo.save(
    categoryNames.map((name) => categoryRepo.create({ name })),
  );
  const [arrays, strings, trees, graphs, dp, binarySearch] = categories;

  // Tags
  const tagNames = [
    'sliding-window',
    'two-pointers',
    'must-revisit',
    'dfs',
    'bfs',
    'memoization',
    'greedy',
    'divide-and-conquer',
  ];
  const tags = await tagRepo.save(
    tagNames.map((name) => tagRepo.create({ name })),
  );
  const [
    slidingWindow,
    twoPointers,
    mustRevisit,
    dfs,
    bfs,
    memoization,
    greedy,
    divideConquer,
  ] = tags;

  // Problems
  const problems: Partial<Problem>[] = [
    {
      title: 'Two Sum',
      leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
      difficulty: Difficulty.Easy,
      status: Status.Solved,
      category: arrays,
      tags: [twoPointers],
      keyTechniques: 'Use hashmap to store complement. O(n) time, O(n) space.',
      timesAttempted: 3,
    },
    {
      title: 'Best Time to Buy and Sell Stock',
      leetcodeUrl:
        'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
      difficulty: Difficulty.Easy,
      status: Status.Solved,
      category: arrays,
      tags: [slidingWindow],
      keyTechniques: 'Track min price seen so far, compute max profit at each step.',
      timesAttempted: 2,
    },
    {
      title: 'Contains Duplicate',
      leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/',
      difficulty: Difficulty.Easy,
      status: Status.Solved,
      category: arrays,
      tags: [],
      keyTechniques: 'Add to a Set, return true if already present.',
      timesAttempted: 1,
    },
    {
      title: 'Maximum Subarray',
      leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/',
      difficulty: Difficulty.Medium,
      status: Status.Solved,
      category: arrays,
      tags: [greedy],
      keyTechniques: "Kadane's algorithm. Reset currentSum to 0 when it goes negative.",
      timesAttempted: 2,
    },
    {
      title: '3Sum',
      leetcodeUrl: 'https://leetcode.com/problems/3sum/',
      difficulty: Difficulty.Medium,
      status: Status.Attempted,
      category: arrays,
      tags: [twoPointers, mustRevisit],
      keyTechniques: 'Sort first, then fix one element and use two-pointer. Handle duplicates carefully by skipping equal adjacent elements.',
      timesAttempted: 3,
    },
    {
      title: 'Valid Anagram',
      leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/',
      difficulty: Difficulty.Easy,
      status: Status.Solved,
      category: strings,
      tags: [],
      keyTechniques: 'Character count map or sort both strings.',
      timesAttempted: 1,
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      leetcodeUrl:
        'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
      difficulty: Difficulty.Medium,
      status: Status.Solved,
      category: strings,
      tags: [slidingWindow],
      keyTechniques: 'Sliding window with a Set. Move left pointer when duplicate detected.',
      timesAttempted: 2,
    },
    {
      title: 'Minimum Window Substring',
      leetcodeUrl:
        'https://leetcode.com/problems/minimum-window-substring/',
      difficulty: Difficulty.Hard,
      status: Status.Attempted,
      category: strings,
      tags: [slidingWindow, mustRevisit],
      keyTechniques: 'Sliding window with two freq maps. Track "formed" count vs "required". Shrink from left when all chars satisfied.',
      timesAttempted: 2,
    },
    {
      title: 'Invert Binary Tree',
      leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/',
      difficulty: Difficulty.Easy,
      status: Status.Solved,
      category: trees,
      tags: [dfs],
      keyTechniques: 'Recursive: swap left/right, then recurse on both children.',
      timesAttempted: 1,
    },
    {
      title: 'Maximum Depth of Binary Tree',
      leetcodeUrl:
        'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
      difficulty: Difficulty.Easy,
      status: Status.Solved,
      category: trees,
      tags: [dfs, bfs],
      keyTechniques: 'DFS: 1 + max(left, right). BFS: count levels.',
      timesAttempted: 1,
    },
    {
      title: 'Binary Tree Level Order Traversal',
      leetcodeUrl:
        'https://leetcode.com/problems/binary-tree-level-order-traversal/',
      difficulty: Difficulty.Medium,
      status: Status.Attempted,
      category: trees,
      tags: [bfs],
      keyTechniques: 'Queue-based BFS. Snapshot queue.length at start of each level.',
      timesAttempted: 2,
    },
    {
      title: 'Number of Islands',
      leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/',
      difficulty: Difficulty.Medium,
      status: Status.Solved,
      category: graphs,
      tags: [dfs, bfs],
      keyTechniques: 'DFS from each unvisited "1" cell, mark visited by setting to "0".',
      timesAttempted: 2,
    },
    {
      title: 'Course Schedule',
      leetcodeUrl: 'https://leetcode.com/problems/course-schedule/',
      difficulty: Difficulty.Medium,
      status: Status.Attempted,
      category: graphs,
      tags: [dfs, mustRevisit],
      keyTechniques: 'Cycle detection in directed graph. 3-color DFS: 0=unvisited, 1=visiting, 2=done.',
      timesAttempted: 3,
    },
    {
      title: 'Climbing Stairs',
      leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
      difficulty: Difficulty.Easy,
      status: Status.Solved,
      category: dp,
      tags: [memoization],
      keyTechniques: 'Fibonacci: dp[i] = dp[i-1] + dp[i-2]. Can optimize to O(1) space.',
      timesAttempted: 1,
    },
    {
      title: 'Coin Change',
      leetcodeUrl: 'https://leetcode.com/problems/coin-change/',
      difficulty: Difficulty.Medium,
      status: Status.Attempted,
      category: dp,
      tags: [memoization, mustRevisit],
      keyTechniques: 'Bottom-up DP. dp[amount] = min coins. Init with Infinity, base dp[0]=0.',
      timesAttempted: 3,
    },
    {
      title: 'Longest Increasing Subsequence',
      leetcodeUrl:
        'https://leetcode.com/problems/longest-increasing-subsequence/',
      difficulty: Difficulty.Medium,
      status: Status.Unsolved,
      category: dp,
      tags: [divideConquer],
      keyTechniques: '',
      timesAttempted: 0,
    },
    {
      title: 'Binary Search',
      leetcodeUrl: 'https://leetcode.com/problems/binary-search/',
      difficulty: Difficulty.Easy,
      status: Status.Solved,
      category: binarySearch,
      tags: [],
      keyTechniques: 'Classic template: lo=0, hi=n-1, mid=(lo+hi)>>1.',
      timesAttempted: 1,
    },
    {
      title: 'Search in Rotated Sorted Array',
      leetcodeUrl:
        'https://leetcode.com/problems/search-in-rotated-sorted-array/',
      difficulty: Difficulty.Medium,
      status: Status.Attempted,
      category: binarySearch,
      tags: [mustRevisit],
      keyTechniques: 'Determine which half is sorted, then decide which half to search.',
      timesAttempted: 3,
    },
  ];

  for (const p of problems) {
    await problemRepo.save(problemRepo.create(p));
  }

  console.log(`Seeded ${problems.length} problems across ${categories.length} categories.`);
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
