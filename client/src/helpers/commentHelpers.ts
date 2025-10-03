interface MentionUser {
  id: string;
  name: string;
  email: string;
}

export const parseMentions = (text: string, users: MentionUser[]): string[] => {
  if (!text || !users?.length) return [];
  const found = new Set<string>();
  for (const u of users) {
    const escaped = u.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|\\s)@?(${escaped})(?=\\b)`, "i");
    if (re.test(text)) found.add(u.name);
  }
  return Array.from(found);
};
