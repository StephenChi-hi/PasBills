export interface Business {
  id: string;
  name: string;
  iconName: string;
}

export const businesses: Business[] = [
  { id: "digital_agency", name: "Digital Agency", iconName: "Palette" },
  { id: "saas_product", name: "SaaS Product", iconName: "Settings" },
  { id: "consulting", name: "Consulting", iconName: "Lightbulb" },
  { id: "ecommerce", name: "E-Commerce", iconName: "ShoppingCart" },
  { id: "content", name: "Content Creation", iconName: "PenTool" },
  { id: "coaching", name: "Coaching", iconName: "Target" },
  { id: "personal", name: "Personal", iconName: "User" },
];

export function getBusinessById(id: string): Business | undefined {
  return businesses.find((b) => b.id === id);
}

export function getBusinessName(id: string): string {
  return getBusinessById(id)?.name || "Unknown";
}
