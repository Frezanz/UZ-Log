import { ContentItem } from "@/types/content";

// Calculate similarity score between two strings (0-1)
export const calculateStringSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Levenshtein distance approach
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// Calculate Levenshtein distance
const getEditDistance = (s1: string, s2: string): number => {
  const costs: number[] = [];

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }

  return costs[s2.length];
};

export interface DuplicatePair {
  item1: ContentItem;
  item2: ContentItem;
  similarity: number; // 0-1 score
  reasons: string[]; // Why they're considered duplicates
}

export const detectDuplicates = (
  items: ContentItem[],
  threshold: number = 0.7,
): DuplicatePair[] => {
  const duplicates: DuplicatePair[] = [];
  const checked = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i];
      const item2 = items[j];
      const pairKey = `${item1.id}-${item2.id}`;

      if (checked.has(pairKey)) continue;
      checked.add(pairKey);

      // Skip if different types
      if (item1.type !== item2.type) continue;

      const reasons: string[] = [];
      let totalScore = 0;
      let factorCount = 0;

      // Check title similarity
      const titleSimilarity = calculateStringSimilarity(item1.title, item2.title);
      if (titleSimilarity > 0.7) {
        reasons.push(`Titles are ${Math.round(titleSimilarity * 100)}% similar`);
        totalScore += titleSimilarity * 0.5; // 50% weight to title
        factorCount += 0.5;
      }

      // Check content similarity (if both have content)
      if (item1.content && item2.content) {
        // For long content, just compare first 200 chars and last 100 chars
        const content1Start = item1.content.substring(0, 200).toLowerCase();
        const content2Start = item2.content.substring(0, 200).toLowerCase();
        
        const startSimilarity = calculateStringSimilarity(content1Start, content2Start);
        if (startSimilarity > 0.65) {
          reasons.push(`Content is ${Math.round(startSimilarity * 100)}% similar`);
          totalScore += startSimilarity * 0.5; // 50% weight to content
          factorCount += 0.5;
        }
      }

      // Check if same category and tags
      if (item1.category && item1.category === item2.category) {
        reasons.push("Same category");
        totalScore += 0.1;
        factorCount += 0.1;
      }

      if (item1.tags && item2.tags) {
        const commonTags = item1.tags.filter((tag) =>
          item2.tags.includes(tag),
        );
        if (commonTags.length > 0) {
          reasons.push(
            `${commonTags.length} common tag${commonTags.length > 1 ? "s" : ""}`,
          );
          totalScore += 0.1;
          factorCount += 0.1;
        }
      }

      const averageScore = factorCount > 0 ? totalScore / factorCount : 0;

      if (averageScore >= threshold && reasons.length > 0) {
        duplicates.push({
          item1,
          item2,
          similarity: Math.min(averageScore, 1),
          reasons,
        });
      }
    }
  }

  // Sort by similarity score (highest first)
  return duplicates.sort((a, b) => b.similarity - a.similarity);
};

export const mergeContentItems = (
  primaryItem: ContentItem,
  duplicateItem: ContentItem,
  mergeOptions?: {
    keepPrimaryTitle?: boolean;
    combineContent?: boolean;
    mergeTags?: boolean;
    mergeCategories?: boolean;
  },
): Partial<ContentItem> => {
  const options = {
    keepPrimaryTitle: true,
    combineContent: false,
    mergeTags: true,
    mergeCategories: true,
    ...mergeOptions,
  };

  const merged: Partial<ContentItem> = {
    title: options.keepPrimaryTitle ? primaryItem.title : duplicateItem.title,
  };

  // Combine content if specified
  if (options.combineContent && primaryItem.content && duplicateItem.content) {
    merged.content = `${primaryItem.content}\n\n---\n\n${duplicateItem.content}`;
  } else {
    merged.content = primaryItem.content || duplicateItem.content;
  }

  // Merge tags
  if (options.mergeTags && primaryItem.tags && duplicateItem.tags) {
    const allTags = [...new Set([...primaryItem.tags, ...duplicateItem.tags])];
    merged.tags = allTags;
  } else {
    merged.tags = primaryItem.tags || duplicateItem.tags || [];
  }

  // Use primary category, or duplicate if primary doesn't have one
  merged.category = primaryItem.category || duplicateItem.category;

  // Keep other fields from primary item
  merged.type = primaryItem.type;
  merged.is_public = primaryItem.is_public;
  merged.status = primaryItem.status;

  return merged;
};
