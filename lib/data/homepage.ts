import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { HomepageSectionRow } from "@/types/database";
import { isDemoMode } from "@/lib/demo-mode";

function isMockMode(): boolean {
  return isDemoMode();
}

const MOCK_SECTIONS: HomepageSectionRow[] = [
  {
    id: "mock-hs-1",
    section_type: "HERO",
    sort_order: 0,
    is_enabled: true,
    config: {},
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "mock-hs-2",
    section_type: "PROMOTIONS",
    sort_order: 10,
    is_enabled: true,
    config: { title: "Promotions actuelles", limit: 5 },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "mock-hs-3",
    section_type: "NEW_PRODUCTS",
    sort_order: 20,
    is_enabled: true,
    config: { title: "Nouveautés", limit: 5 },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "mock-hs-4",
    section_type: "FEATURED_CATEGORY",
    sort_order: 30,
    is_enabled: true,
    config: { title: "Plateaux Saumon", subtitle: "La signature", category_slug: "plateaux-saumon", limit: 4 },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "mock-hs-5",
    section_type: "GALLERY",
    sort_order: 50,
    is_enabled: true,
    config: { title: "Galeries Terminal 3" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "mock-hs-6",
    section_type: "INSPIRATIONS",
    sort_order: 60,
    is_enabled: true,
    config: { title: "Inspirations", limit: 6 },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "mock-hs-7",
    section_type: "MEMBERSHIP",
    sort_order: 70,
    is_enabled: true,
    config: {},
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export async function getHomepageSections(): Promise<HomepageSectionRow[]> {
  if (isMockMode()) {
    return MOCK_SECTIONS.filter((s) => s.is_enabled);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return MOCK_SECTIONS.filter((s) => s.is_enabled);
  }
  return data;
}

export async function getAllHomepageSections(): Promise<HomepageSectionRow[]> {
  if (isMockMode()) {
    return MOCK_SECTIONS;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return MOCK_SECTIONS;
  return data;
}

export async function updateHomepageSection(
  id: string,
  input: Partial<Pick<HomepageSectionRow, "is_enabled" | "sort_order" | "config">>,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("homepage_sections")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message ?? "update_homepage_section_failed");
}

export async function createHomepageSection(
  sectionType: HomepageSectionRow["section_type"],
  sortOrder: number,
  config: Record<string, unknown> = {},
): Promise<HomepageSectionRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_sections")
    .insert({
      section_type: sectionType,
      sort_order: sortOrder,
      is_enabled: true,
      config,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "create_homepage_section_failed");
  }
  return data;
}

export async function deleteHomepageSection(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("homepage_sections")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message ?? "delete_homepage_section_failed");
}
