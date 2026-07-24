import { AccountMenuContent } from "@/components/account-menu";
import { getCurrentUser } from "@/lib/utils/current-user";

export async function AccountMenuServer() {
  const user = await getCurrentUser();
  return <AccountMenuContent user={user} />;
}
