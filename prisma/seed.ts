// @ts-nocheck
import { readFileSync } from "node:fs";
import { PrismaClient, Difficulty } from "../generated/prisma/index.js";

const prisma = new PrismaClient();
const sheetUrl = "https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet";
const source = JSON.parse(readFileSync(new URL("./data/striver-a2z.json", import.meta.url), "utf8"));
const platformLinksSource = JSON.parse(readFileSync(new URL("./data/a2z-platform-links.json", import.meta.url), "utf8"));

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function titleKey(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ""); }
function difficulty(value: string) { if (value === "Hard") return Difficulty.HARD; if (value === "Medium") return Difficulty.MEDIUM; return Difficulty.EASY; }
function platformUrl(value: unknown, domains: string[]) {
  if (typeof value !== "string" || !value) return null;
  return domains.some((domain) => value.includes(domain)) ? value : null;
}
const platformLinksByTitle = new Map(platformLinksSource.map((item: any) => [titleKey(item.title), item.links]));
const genericTitleWords = new Set(["a", "an", "and", "array", "arrays", "for", "given", "in", "is", "number", "numbers", "of", "on", "problem", "problems", "the", "to", "using", "with"]);
function titleTokens(value: string) {
  return new Set(value.toLowerCase().replace(/2\s*sum/g, "two sum").replace(/3\s*sum/g, "three sum").replace(/4\s*sum/g, "four sum").match(/[a-z]+/g)?.filter((word) => !genericTitleWords.has(word)) || []);
}
function titleScore(left: string, right: string) {
  const a = titleTokens(left);
  const b = titleTokens(right);
  if (!a.size || !b.size) return 0;
  return [...a].filter((word) => b.has(word)).length / Math.max(a.size, b.size);
}
function fetchedLinksForTitle(title: string, section: string) {
  const key = titleKey(title);
  const exactInSection = platformLinksSource.find((item: any) => item.stepTitle === section && titleKey(item.title) === key);
  if (exactInSection) return exactInSection.links;
  const exact = platformLinksByTitle.get(key);
  if (exact) return exact;
  const candidates = platformLinksSource
    .filter((item: any) => item.stepTitle === section)
    .map((item: any) => ({ ...item, score: titleScore(title, item.title) }))
    .filter((item: any) => item.score >= 0.5)
    .sort((a: any, b: any) => b.score - a.score || Math.abs(titleKey(a.title).length - key.length) - Math.abs(titleKey(b.title).length - key.length));
  const fuzzy = candidates[0];
  if (fuzzy) return fuzzy.links;
  const broader = platformLinksSource
    .filter((item: any) => {
      const candidate = titleKey(item.title);
      return candidate.length > 6 && (candidate.includes(key) || key.includes(candidate));
    })
    .sort((a: any, b: any) => Math.abs(titleKey(a.title).length - key.length) - Math.abs(titleKey(b.title).length - key.length))[0];
  return broader?.links || {};
}
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

// The A2Z sheet and GFG use different names for several identical problems.
const gfgUrlByTitle: Record<string, string> = {
  rearrangearrayelementsbysign: "https://www.geeksforgeeks.org/problems/array-of-alternate-ve-and-ve-nos1401/1",
  subsetsi: "https://www.geeksforgeeks.org/problems/subset-sums2234/1",
  introductionsinglylinkedlist: "https://www.geeksforgeeks.org/problems/introduction-to-linked-list/1",
  insertionattheheadoflinkedlist: "https://www.geeksforgeeks.org/problems/linked-list-insertion-1587115620/0",
  insertnodebeforeheadindoublylinkedlist: "https://www.geeksforgeeks.org/problems/insert-a-node-in-doubly-linked-list/1",
  deletionoftheheadofll: "https://www.geeksforgeeks.org/problems/delete-head-of-doubly-linked-list/1",
  stringtointegeratoi: "https://www.geeksforgeeks.org/problems/implement-atoi/1",
  singlenumberi: "https://www.geeksforgeeks.org/problems/element-appearing-once2552/0",
  singlenumberiii: "https://www.geeksforgeeks.org/problems/two-numbers-with-only-1-set-bit/1",
  replaceelementsbytheirrank: "https://www.geeksforgeeks.org/problems/replace-elements-by-its-rank-in-the-array/1",
  powxn: "https://www.geeksforgeeks.org/problems/power-of-numbers-1587115620/1",
  numberofgreaterelementstotheright: "https://www.geeksforgeeks.org/problems/number-of-nges-to-the-right/1",
  printroottoleafpathinbt: "https://www.geeksforgeeks.org/problems/root-to-leaf-paths/1",
  maximumdepthinbt: "https://www.geeksforgeeks.org/problems/height-of-binary-tree/1",
  lcainbt: "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1",
  serializeanddeserializebt: "https://www.geeksforgeeks.org/problems/serialize-and-deserialize-a-binary-tree/1",
  traversaltechniques: "https://www.geeksforgeeks.org/problems/preorder-traversal/1",
  insertagivennodeinbst: "https://www.geeksforgeeks.org/problems/insert-a-node-in-a-bst/1",
  lcainbst: "https://practice.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1",
  numberofislands: "https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1",
  assigncookies: "https://www.geeksforgeeks.org/problems/assign-cookies/1",
  addtwonumbersinlinkedlist: "https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1",
  minimumcosttoconnectsticks: "https://www.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1",
  introductiontobst: "https://www.geeksforgeeks.org/problems/introduction-to-binary-search-tree/1",
  trieimplementationandoperations: "https://www.geeksforgeeks.org/problems/trie-insert-and-search0656/1",
  introductiontodp: "https://www.geeksforgeeks.org/problems/dynamic-programming-1587115620/1",
  checkifthenumberisarmstrong: "https://www.geeksforgeeks.org/problems/armstrong-numbers2727/1",
  highestoccurringelementinanarray: "https://www.geeksforgeeks.org/problems/most-frequent-element-in-an-array/1",
  gcdoftwonumbers: "https://www.geeksforgeeks.org/problems/gcd-of-two-numbers3459/1",
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
  await prisma.admin.upsert({ where: { email: "ankurp22singh@gmail.com" }, update: {}, create: { email: "ankurp22singh@gmail.com" } });
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
    const fetchedLinks = fetchedLinksForTitle(item.problem_name, item.topic);
    const links = {
      youtube: item.youtube_url || null,
      leetcode: platformUrl(item.leetcode_url, ["leetcode.com"]) || platformUrl(fetchedLinks.leetcode, ["leetcode.com"]),
      gfg: gfgUrlBySheetNumber[item.id] || gfgUrlByTitle[titleKey(item.problem_name)] || platformUrl(fetchedLinks.gfg, ["geeksforgeeks.org"]),
      codingninjas: platformUrl(fetchedLinks.codingninjas, ["codingninjas.com", "code360.com", "naukri.com/code360"]),
    };
    const externalUrl = links.leetcode || links.gfg || links.codingninjas || sheetUrl;
    const platform = links.leetcode ? "LeetCode" : links.gfg ? "GeeksforGeeks" : links.codingninjas ? "Coding Ninjas" : "TakeUForward";
    await prisma.question.upsert({
      where: { slug },
      update: { sheetNumber: item.id, title: item.problem_name.trim(), externalUrl, youtubeUrl: item.youtube_url || null, platform, platformLinks: links, difficulty: difficulty(item.difficulty), topicId: topic.id, subtopicId: subtopic.id, order, isActive: true },
      create: { sheetNumber: item.id, title: item.problem_name.trim(), slug, externalUrl, youtubeUrl: item.youtube_url || null, platform, platformLinks: links, difficulty: difficulty(item.difficulty), topicId: topic.id, subtopicId: subtopic.id, order, isActive: true },
    });
  }
  console.log(`Seeded ${source.length} Striver A2Z questions across ${topics.size} topics.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
