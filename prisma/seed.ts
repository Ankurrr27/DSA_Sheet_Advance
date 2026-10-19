// @ts-nocheck
import { readFileSync } from "node:fs";
import { PrismaClient, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();
const sheetUrl = "https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet";
const source = JSON.parse(readFileSync(new URL("./data/striver-a2z.json", import.meta.url), "utf8"));

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function difficulty(value: string) { if (value === "Hard") return Difficulty.HARD; if (value === "Medium") return Difficulty.MEDIUM; return Difficulty.EASY; }
const parentBySection: Record<string, string> = {
  "Learn the basics": "Foundations",
  "Learn Important Sorting Techniques": "Sorting",
  "Solve Problems on Arrays [Easy -> Medium -> Hard]": "Arrays",
  "Binary Search [1D, 2D Arrays, Search Space]": "Binary Search",
  "Strings [Basic and Medium]": "Strings",
  "Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]": "Linked List",
  "Recursion [PatternWise]": "Recursion",
  "Bit Manipulation [Concepts & Problems]": "Bit Manipulation",
  "Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]": "Stack & Queue",
  "Sliding Window & Two Pointer Combined Problems": "Sliding Window & Two Pointer",
  "Heaps [Learning, Medium, Hard Problems]": "Heaps",
  "Greedy Algorithms [Easy, Medium/Hard]": "Greedy",
  "Binary Trees [Traversals, Medium and Hard Problems]": "Trees",
  "Binary Search Trees [Concept and Problems]": "Trees",
  "Graphs [Concepts & Problems]": "Graphs",
  "Dynamic Programming [Patterns and Problems]": "Dynamic Programming",
  "Tries": "Tries",
  "Strings": "Advanced Strings",
};
const displaySubtopicBySection: Record<string, string> = {
  "Learn the basics": "Fundamentals",
  "Learn Important Sorting Techniques": "Sorting Techniques",
  "Solve Problems on Arrays [Easy -> Medium -> Hard]": "Array Problems",
  "Strings [Basic and Medium]": "Basic & Medium Strings",
  "Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]": "Single & Double Linked Lists",
  "Recursion [PatternWise]": "Recursion Patterns",
  "Bit Manipulation [Concepts & Problems]": "Concepts & Problems",
  "Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]": "Stacks, Queues & Monotonic Stack",
  "Sliding Window & Two Pointer Combined Problems": "Sliding Window & Two Pointers",
  "Heaps [Learning, Medium, Hard Problems]": "Heap Fundamentals & Problems",
  "Greedy Algorithms [Easy, Medium/Hard]": "Greedy Problems",
  "Binary Trees [Traversals, Medium and Hard Problems]": "Binary Tree Problems",
  "Binary Search Trees [Concept and Problems]": "BST Concepts & Problems",
  "Graphs [Concepts & Problems]": "Graph Concepts & Problems",
  "Dynamic Programming [Patterns and Problems]": "DP Patterns & Problems",
  "Tries": "Trie Problems",
  "Strings": "Advanced String Algorithms",
};

const gfgUrlBySheetNumber: Record<number, string> = {
  65: "https://www.geeksforgeeks.org/dsa/remove-duplicates-sorted-array/",
  66: "https://www.geeksforgeeks.org/dsa/array-rotation/",
  67: "https://www.geeksforgeeks.org/dsa/array-rotation/",
  68: "https://www.geeksforgeeks.org/dsa/move-zeroes-end-array/",
  69: "https://www.geeksforgeeks.org/linear-search/",
  70: "https://www.geeksforgeeks.org/problems/union-of-two-sorted-arrays-with-distinct-elements/1",
  71: "https://www.geeksforgeeks.org/problems/missing-number-in-array1416/1",
  72: "https://www.geeksforgeeks.org/dsa/maximum-consecutive-ones-or-1s-in-a-binary-array/",
};

const splitSubtopics: Record<string, Array<{ name: string; from: number; to: number }>> = {
  "Learn the basics": [
    { name: "Programming Fundamentals", from: 1, to: 11 }, { name: "Patterns", from: 12, to: 33 },
    { name: "STL & Collections", from: 34, to: 35 }, { name: "Math Fundamentals", from: 36, to: 42 },
    { name: "Recursion Basics", from: 43, to: 51 }, { name: "Hashing Basics", from: 52, to: 54 },
  ],
  "Solve Problems on Arrays [Easy -> Medium -> Hard]": [
    { name: "Array Fundamentals", from: 62, to: 75 }, { name: "Array Techniques", from: 76, to: 85 },
    { name: "Matrix Problems", from: 86, to: 90 }, { name: "Advanced Array Problems", from: 91, to: 101 },
  ],
  "Binary Search [1D, 2D Arrays, Search Space]": [
    { name: "1D Binary Search", from: 102, to: 115 }, { name: "Search Space", from: 116, to: 128 }, { name: "2D Binary Search", from: 129, to: 133 },
  ],
  "Strings [Basic and Medium]": [
    { name: "String Basics", from: 134, to: 143 }, { name: "String Algorithms", from: 144, to: 148 },
  ],
  "Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]": [
    { name: "Singly Linked List", from: 149, to: 153 }, { name: "Doubly Linked List", from: 154, to: 157 },
    { name: "Linked List Patterns", from: 158, to: 172 }, { name: "Doubly Linked List Problems", from: 173, to: 175 }, { name: "Advanced Linked List", from: 176, to: 179 },
  ],
  "Recursion [PatternWise]": [
    { name: "Recursion Fundamentals", from: 180, to: 186 }, { name: "Subsequences & Subsets", from: 187, to: 195 }, { name: "Backtracking", from: 196, to: 204 },
  ],
  "Bit Manipulation [Concepts & Problems]": [
    { name: "Bit Concepts", from: 205, to: 213 }, { name: "XOR & Power Set", from: 214, to: 217 }, { name: "Prime & Number Theory", from: 218, to: 222 },
  ],
  "Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]": [
    { name: "Stack & Queue Implementation", from: 223, to: 230 }, { name: "Expression Conversion", from: 231, to: 236 },
    { name: "Monotonic Stack", from: 237, to: 249 }, { name: "Design Problems", from: 250, to: 252 },
  ],
  "Sliding Window & Two Pointer Combined Problems": [
    { name: "Sliding Window", from: 253, to: 260 }, { name: "Two Pointer", from: 261, to: 264 },
  ],
  "Heaps [Learning, Medium, Hard Problems]": [
    { name: "Heap Fundamentals", from: 265, to: 269 }, { name: "Heap Problems", from: 270, to: 281 },
  ],
  "Greedy Algorithms [Easy, Medium/Hard]": [
    { name: "Greedy Fundamentals", from: 282, to: 289 }, { name: "Scheduling Problems", from: 290, to: 293 }, { name: "Interval Problems", from: 294, to: 296 },
  ],
  "Binary Trees [Traversals, Medium and Hard Problems]": [
    { name: "Tree Traversals", from: 297, to: 308 }, { name: "Binary Tree Problems", from: 309, to: 327 }, { name: "Tree Construction & Transformation", from: 328, to: 334 },
  ],
  "Binary Search Trees [Concept and Problems]": [
    { name: "BST Fundamentals", from: 335, to: 344 }, { name: "Advanced BST Problems", from: 345, to: 350 },
  ],
  "Graphs [Concepts & Problems]": [
    { name: "Graph Foundations", from: 351, to: 360 }, { name: "Traversal & Connectivity", from: 361, to: 377 },
    { name: "Shortest Path", from: 378, to: 390 }, { name: "MST & Disjoint Set", from: 391, to: 403 },
  ],
  "Dynamic Programming [Patterns and Problems]": [
    { name: "DP Fundamentals", from: 404, to: 410 }, { name: "DP on Grids", from: 411, to: 415 },
    { name: "Subset & Knapsack DP", from: 416, to: 426 }, { name: "String DP", from: 427, to: 436 },
    { name: "Stocks & Subsequences DP", from: 437, to: 449 }, { name: "Partition DP", from: 450, to: 458 },
  ],
  "Tries": [
    { name: "Trie Implementation", from: 459, to: 460 }, { name: "Trie String Problems", from: 461, to: 463 }, { name: "Trie XOR Problems", from: 464, to: 465 },
  ],
  "Strings": [
    { name: "Advanced String Problems", from: 466, to: 474 },
  ],
};

function subtopicName(section: string, id: number) {
  const definition = splitSubtopics[section]?.find((item) => id >= item.from && id <= item.to);
  return definition?.name || displaySubtopicBySection[section] || section;
}

async function main() {
  const topicNames = [...new Set(source.map((item: any) => parentBySection[item.topic] || item.topic))];
  const topics = new Map<string, any>();
  for (const [order, name] of topicNames.entries()) {
    const slug = slugify(name);
    const topic = await prisma.topic.upsert({ where: { slug }, update: { name, order }, create: { name, slug, order } });
    topics.set(name, topic);
  }
  const subtopics = new Map<string, any>();
  for (const [order, section] of [...new Set(source.map((item: any) => item.topic))].entries()) {
    const parentName = parentBySection[section] || section;
    const parent = topics.get(parentName);
    const displayNames = splitSubtopics[section]?.map((item) => item.name) || [displaySubtopicBySection[section] || section];
    for (const [subOrder, displayName] of displayNames.entries()) {
      const slug = `${parent.slug}-${slugify(displayName)}`;
      const subtopic = await prisma.subtopic.upsert({ where: { slug }, update: { name: displayName, order: order * 10 + subOrder, topicId: parent.id }, create: { name: displayName, slug, order: order * 10 + subOrder, topicId: parent.id } });
      subtopics.set(`${section}:${displayName}`, subtopic);
    }
  }
  const titleOccurrences = new Map<string, number>();
  for (const [order, item] of source.entries()) {
    const topic = topics.get(parentBySection[item.topic] || item.topic);
    const displayName = subtopicName(item.topic, item.id);
    const subtopic = subtopics.get(`${item.topic}:${displayName}`);
    const titleSlug = slugify(item.problem_name);
    const occurrence = titleOccurrences.get(titleSlug) ?? 0;
    titleOccurrences.set(titleSlug, occurrence + 1);
    const slug = occurrence === 0 ? titleSlug : `${titleSlug}-${topic.slug}`;
    const gfgUrl = gfgUrlBySheetNumber[item.id];
    const externalUrl = item.leetcode_url || gfgUrl || sheetUrl;
    const platform = item.leetcode_url ? "LeetCode" : gfgUrl ? "GeeksforGeeks" : "TakeUForward";
    await prisma.question.upsert({
      where: { slug },
      update: { sheetNumber: item.id, title: item.problem_name.trim(), externalUrl, youtubeUrl: item.youtube_url || null, platform, difficulty: difficulty(item.difficulty), topicId: topic.id, subtopicId: subtopic.id, order, isActive: true },
      create: { sheetNumber: item.id, title: item.problem_name.trim(), slug, externalUrl, youtubeUrl: item.youtube_url || null, platform, difficulty: difficulty(item.difficulty), topicId: topic.id, subtopicId: subtopic.id, order, isActive: true },
    });
  }
  console.log(`Seeded ${source.length} Striver A2Z questions across ${topics.size} topics.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
