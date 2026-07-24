import { NavUser } from "@/components/nav-user";
import { getCurrentUser } from "@/lib/utils/current-user";

export async function NavUserServer() {
  const user = await getCurrentUser();
  return <NavUser user={user} />;
}
