"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
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
import { AccountToasts } from "@/components/account-toasts";
import { accountInitials } from "@/components/account-initials";
import { getAccountPageData, updateProfile, changePassword, deleteAccount } from "@/lib/actions/account.action";
import {
  getAccountDataCacheRevision,
  loadAccountData,
  readAccountDataCache,
  subscribeAccountDataCache,
} from "@/components/account/account-data-cache";

export function AccountPageClient() {
  const user = readAccountDataCache();
  const revision = useSyncExternalStore(
    subscribeAccountDataCache,
    getAccountDataCacheRevision,
    () => 0,
  );

  useEffect(() => {
    if (readAccountDataCache()) return;
    loadAccountData(getAccountPageData)
      .then(() => undefined)
      .catch(() => undefined);
  }, [revision, user]);

  if (!user) return <AccountSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <AccountToasts />
      <div>
        <h1 className="font-heading text-2xl font-medium">Account</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, password, and account.</p>
      </div>

      <div className="flex w-full flex-col gap-3 md:flex-row">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your name is shown across the app.</CardDescription>
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
                <Input id="name" name="name" defaultValue={user.name} required maxLength={40} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={user.email} disabled />
              </div>
            </CardContent>
            <CardFooter className="mt-2 justify-end">
              <Button type="submit">Save changes</Button>
            </CardFooter>
          </form>
        </Card>

        <Card id="password" className="w-full">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Update the password you sign in with.</CardDescription>
          </CardHeader>
          <form action={changePassword}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
              </div>
            </CardContent>
            <CardFooter className="mt-2 justify-end">
              <Button type="submit">Update password</Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Card id="danger" className="ring-destructive">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Permanently delete your account and all its data.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-end">
          <Dialog>
            <DialogTrigger render={<Button variant="destructive" />}>Delete account</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>This permanently deletes your account and all data. This can&apos;t be undone.</DialogDescription>
              </DialogHeader>
              <form action={deleteAccount} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="delete-password">Confirm your password</Label>
                  <Input id="delete-password" name="password" type="password" autoComplete="current-password" required />
                </div>
                <DialogFooter>
                  <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
                  <Button type="submit" variant="destructive">Delete account</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}
