"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { NotificationIndicator } from "./notificationsInd";
import { useUserData } from "@/hooks/user/useUserData";
import { HomeIcon, UserIcon, BellIcon, MailIcon, UsersIcon, PlusIcon } from "lucide-react";

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { userData } = useUserData();

  return (
    <div className="flex w-full min-h-screen bg-background">
      {/* Left Sidebar - fixed */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border hidden md:flex flex-col p-4 overflow-y-auto bg-background z-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Social Network</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavItem href="/home" icon={<HomeIcon className="h-5 w-5" />} label="Home" active={pathname === "/home"} />
          <NavItem href="/profile" icon={<UserIcon className="h-5 w-5" />} label="Profile" active={pathname.startsWith("/profile")} />
          <NavItem href="/notifications" icon={<BellIcon className="h-5 w-5" />} label="Notifications" active={pathname === "/notifications"} />
          <NavItem href="/messages" icon={<MailIcon className="h-5 w-5" />} label="Messages" active={pathname === "/messages"} />
          <NavItem href="/groups" icon={<UsersIcon className="h-5 w-5" />} label="Groups" active={pathname === "/groups"} />
        </nav>
        
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 font-medium mb-4">
          New Post
        </button>
        
        <div className="mt-auto">
          {userData && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {userData.avatar ? (
                  <img src={userData.avatar} alt={userData.username} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">{userData.username}</p>
                <p className="text-sm text-muted-foreground">@{userData.username}</p>
              </div>
            </div>
          )}
          <LogoutButton />
        </div>
      </aside>

      {/* Spacer div to push content right on desktop */}
      <div className="hidden md:block w-64 flex-shrink-0"></div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Top Header */}
        <header className="h-14 border-b border-border flex items-center px-4 sticky top-0 bg-background z-10">
          <h2 className="text-xl font-semibold">
            {pathname === "/home" && "Home"}
            {pathname.startsWith("/profile") && "Profile"}
            {pathname === "/notifications" && "Notifications"}
            {pathname === "/messages" && "Messages"}
            {pathname === "/groups" && "Groups"}
          </h2>
          <div className="ml-auto">
            <NotificationIndicator />
          </div>
        </header>
        
        {/* Content Container with Feed and Right Sidebar */}
        <div className="flex w-full">
          {/* Center Feed */}
          <main className="flex-1 border-x border-border min-h-[calc(100vh-3.5rem)]">
            {children}
          </main>
          
          {/* Right Sidebar */}
          <aside className="hidden lg:block w-80 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 bg-background">
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">Who to follow</h3>
              <div className="space-y-4">
                {/* Placeholder for suggested users */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div>
                      <p className="font-medium">User Name</p>
                      <p className="text-sm text-muted-foreground">@username</p>
                    </div>
                  </div>
                  <button className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium">
                    Follow
                  </button>
                </div>
                {/* More suggested users */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div>
                      <p className="font-medium">Another User</p>
                      <p className="text-sm text-muted-foreground">@anotheruser</p>
                    </div>
                  </div>
                  <button className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium">
                    Follow
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-bold mb-2">Trending</h3>
              <div className="space-y-4">
                {/* Trending topics */}
                <div>
                  <p className="text-sm text-muted-foreground">Trending in your area</p>
                  <p className="font-medium">#SocialNetwork</p>
                  <p className="text-sm text-muted-foreground">1,234 posts</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trending in Technology</p>
                  <p className="font-medium">#ReactJS</p>
                  <p className="text-sm text-muted-foreground">892 posts</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trending Worldwide</p>
                  <p className="font-medium">#WebDevelopment</p>
                  <p className="text-sm text-muted-foreground">2,547 posts</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around md:hidden z-10">
        <Link href="/home" className={pathname === "/home" ? "text-primary" : "text-muted-foreground"}>
          <HomeIcon className="h-6 w-6" />
        </Link>
        <Link href="/profile" className={pathname.startsWith("/profile") ? "text-primary" : "text-muted-foreground"}>
          <UserIcon className="h-6 w-6" />
        </Link>
        <Link href="/notifications" className={pathname === "/notifications" ? "text-primary" : "text-muted-foreground"}>
          <BellIcon className="h-6 w-6" />
        </Link>
        <Link href="/messages" className={pathname === "/messages" ? "text-primary" : "text-muted-foreground"}>
          <MailIcon className="h-6 w-6" />
        </Link>
        <Link href="/groups" className={pathname === "/groups" ? "text-primary" : "text-muted-foreground"}>
          <UsersIcon className="h-6 w-6" />
        </Link>
      </div>

      {/* Mobile New Post Button */}
      <button className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg z-20">
        <PlusIcon className="h-6 w-6" />
      </button>
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
};

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link 
      href={href} 
      className={`flex items-center px-4 py-3 rounded-full text-lg hover:bg-muted transition-colors ${active ? 'font-semibold' : ''}`}
    >
      <span className={`mr-4 ${active ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</span>
      <span className={active ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </Link>
  );
}