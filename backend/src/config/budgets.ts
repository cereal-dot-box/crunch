// Budget bucket category mappings (immutable)
// User customizations (name, limit, color) come from database

export interface BudgetBucketConfig {
  id: string;
  name: string;
  icon: string;
  monthlyLimit: number;
  categoryPatterns: string[];
  color: string;
}

export const DEFAULT_BUDGETS: BudgetBucketConfig[] = [
  {
    id: 'food',
    name: 'Food',
    icon: '',
    monthlyLimit: 500,
    categoryPatterns: [
      'Food and Drink',
      'Restaurants',
      'Fast Food',
      'Coffee',
      'Groceries',
    ],
    color: 'bg-orange-500',
  },
  {
    id: 'fun',
    name: 'Fun',
    icon: '',
    monthlyLimit: 600,
    categoryPatterns: [
      'Entertainment',
      'Recreation',
      'Movies',
      'Music',
      'Games',
      'Bars',
      'Nightlife',
      'Arts',
      'Sports',
      'Shopping',
      'Clothing',
      'Electronics',
      'General Merchandise',
      'Online Shopping',
      'Department Stores',
      'Transportation',
      'Gas',
      'Fuel',
      'Parking',
      'Public Transit',
      'Uber',
      'Lyft',
      'Taxi',
    ],
    color: 'bg-purple-500',
  },
];

// Helper function to map transaction category to bucket
// Uses immutable categoryPatterns from DEFAULT_BUDGETS
export function categorizeToBucket(
  categoryName: string | null,
  categoryHierarchy: string | null
): string {
  if (!categoryName && !categoryHierarchy) return 'fun';

  const searchText = `${categoryName || ''} ${categoryHierarchy || ''}`.toLowerCase();

  for (const bucket of DEFAULT_BUDGETS) {
    for (const pattern of bucket.categoryPatterns) {
      if (searchText.includes(pattern.toLowerCase())) {
        return bucket.id;
      }
    }
  }

  return 'fun';
}
