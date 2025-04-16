// 'use client';

// import './globals.css';
// import { ReactNode } from 'react';
// import { useAuth } from '@/hooks/user/checkAuth';
// import { ProfileMenuItem } from '@/components/ProfileMenuItem';
// import { LogoutButton } from '@/components/logout-button';
// import Link from 'next/link';
// import { House, Mail, Bell, Users, Slack } from 'lucide-react';
// import { usePathname } from 'next/navigation';
// import { ThemeProvider } from '@/components/theme-provider';
// import { ModeToggle } from '@/components/theme-toggle';

// export default function RootLayout({ children }: { children: ReactNode }) {
//   const { isLoading: authLoading, isAuthenticated } = useAuth({
//     required: true,
//     redirectTo: '/',
//   });

//   const pathname = usePathname();
//   const isMessagesPage = pathname === '/message';
//   const isTotoIAPage = pathname === '/toto-ia';

//   if (authLoading) {
//     return (
//       <html lang='en'>
//         <body>
//           <div>Chargement...</div>
//         </body>
//       </html>
//     );
//   }

//   if (!isAuthenticated) {
//     // Affiche juste les enfants (ex: page de login, etc.)
//     return (
//       <>
//         <html lang='en'>
//           <body className='bg-white text-gray-900'>{children}</body>
//         </html>
//       </>
//     );
//   }

// return (
//   <html lang='en'>
//     <body>
//       <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
//         <div className='h-screen grid grid-cols-5 grid-rows-[auto_1fr]'>
//           {/* Top bar */}
//           <header className='col-span-5 px-4 py-3 border-b flex justify-between items-center'>
//             <div className='font-bold text-lg'>My App</div>
//             <LogoutButton />
//           </header>

//           {/* Sidebar gauche */}
//           <aside className='row-start-2 border-r p-4 flex flex-col justify-between'>
//             <ul className='space-y-2'>
//               <li>
//                 <Link href='/' className='block px-2 py-1 hover:bg-gray-200 rounded'>
//                   <House className='inline mr-2' />
//                   Accueil
//                 </Link>
//               </li>
//               <ProfileMenuItem />
//               <li>
//                 <Link href='/notifications' className='block px-2 py-1 hover:bg-gray-200 rounded'>
//                   <Bell className='inline mr-2' />
//                   Notifications
//                 </Link>
//               </li>
//               <li>
//                 <Link href='/message' className='block px-2 py-1 hover:bg-gray-200 rounded'>
//                   <Mail className='inline mr-2' />
//                   Messages
//                 </Link>
//               </li>
//               <li>
//                 <Link href='/toto-ia' className='block px-2 py-1 hover:bg-gray-200 rounded'>
//                   <Slack className='inline mr-2' />
//                   ToToIA
//                 </Link>
//               </li>
//               <li>
//                 <Link href='/groupes' className='block px-2 py-1 hover:bg-gray-200 rounded'>
//                   <Users className='inline mr-2' />
//                   Communautés
//                 </Link>
//               </li>
//             </ul>
//             <div className='flex flex-col items-center'>
//               <ModeToggle />
//             </div>
//           </aside>

//           {/* Contenu central */}
//           <main className={`row-start-2 overflow-y-auto p-4 border-x ${isMessagesPage || isTotoIAPage ? 'col-span-4' : 'col-span-3'}`}>{children}</main>
//           {/* Sidebar droite */}
//           {!isMessagesPage && !isTotoIAPage && (
//             <aside className='row-start-2 border-l p-4'>
//               <p>Suggestions, stats, etc.</p>
//             </aside>
//           )}
//         </div>
//       </ThemeProvider>
//     </body>
//   </html>
// );

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { WebSocketProvider } from '@/contexts/websocket-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Social Network',
  description: 'A modern social networking platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WebSocketProvider>{children}</WebSocketProvider>
      </body>
    </html>
  );
}
