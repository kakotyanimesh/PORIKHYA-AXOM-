import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { auth, APIError } from "@repo/auth";
import { getCurrentUser } from "@/lib/utils/current-user";
import { AccountToasts } from "@/components/account-toasts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";

async function updateProfile(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/account?profile_error=Name+can%27t+be+empty");

  const requestHeaders = await headers();

  try {
    await auth.api.updateUser({ headers: requestHeaders, body: { name } });
  } catch (error) {
    if (error instanceof APIError) {
      redirect(`/account?profile_error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  const session = await auth.api.getSession({ headers: requestHeaders });
  if (session) revalidateTag(`account:${session.user.id}`, "days");

  redirect("/account?profile_success=1");
}

async function changePassword(formData: FormData) {
  "use server";
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length < 8) {
    redirect(
      "/account?password_error=New+password+must+be+at+least+8+characters#password",
    );
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: { currentPassword, newPassword, revokeOtherSessions: true },
    });
  } catch (error) {
    if (error instanceof APIError) {
      redirect(
        `/account?password_error=${encodeURIComponent(error.message)}#password`,
      );
    }
    throw error;
  }
  redirect("/account?password_success=1#password");
}

async function deleteAccount(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");

  try {
    await auth.api.deleteUser({ headers: await headers(), body: { password } });
  } catch (error) {
    if (error instanceof APIError) {
      redirect(
        `/account?delete_error=${encodeURIComponent(error.message)}#danger`,
      );
    }
    throw error;
  }
  redirect("/signin");
}

function accountInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <AccountToasts />
      <div>
        <h1 className="font-heading text-2xl font-medium">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, password, and account.
        </p>
      </div>

      <div className="flex md:flex-row flex-col gap-3 w-full">
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your name is shown across the app.
            </CardDescription>
          </CardHeader>
          <form action={updateProfile}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback>{accountInitials(user.name)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  required
                  maxLength={40}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={user.email} disabled />
              </div>
            </CardContent>
            <CardFooter className="justify-end mt-2">
              <Button type="submit">Save changes</Button>
            </CardFooter>
          </form>
        </Card>

        <Card id="password" className="w-full">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Update the password you sign in with.
            </CardDescription>
          </CardHeader>
          <form action={changePassword}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end mt-2">
              <Button type="submit">Update password</Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Card id="danger" className="ring-destructive ">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all its data.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-end">
          <Dialog>
            <DialogTrigger render={<Button variant="destructive" />}>
              Delete account
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  This permanently deletes your account and all data. This
                  can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>
              <form action={deleteAccount} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="delete-password">Confirm your password</Label>
                  <Input
                    id="delete-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <DialogFooter>
                  <DialogClose
                    render={<Button type="button" variant="outline" />}
                  >
                    Cancel
                  </DialogClose>
                  <Button type="submit" variant="destructive">
                    Delete account
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
