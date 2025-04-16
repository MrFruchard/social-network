// 'use client';

// import * as React from 'react';
// import * as TabsPrimitive from '@radix-ui/react-tabs';
// import { cn } from '@/lib/utils';
// import { X, Users, Search } from 'lucide-react';
// import { useState, useEffect } from 'react';

// interface User {
//   id: string;
//   username: string;
//   email: string;
// }

// export default function CreateChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
//   const [search, setSearch] = useState('');
//   const [searchResults, setSearchResults] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // Fonction de recherche avec debounce
//   const searchUsers = async (query: string) => {
//     if (query.length < 2) {
//       setSearchResults([]);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
//       const data = await response.json();
//       setSearchResults(data);
//     } catch (error) {
//       console.error('Error searching users:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Effet pour déclencher la recherche
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       searchUsers(search);
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [search]);
//   if (!isOpen) return null;

//   return (
//     <div className='fixed inset-0 z-50'>
//       <div className='fixed inset-0 bg-black/70 backdrop-blur-sm' onClick={onClose} />
//       <div className='fixed inset-0 flex items-center justify-center p-4'>
//         <div className='w-full max-w-md rounded-xl bg-black text-white shadow-xl border border-gray-700'>
//           <div className='flex items-center justify-between px-4 py-3 border-b border-gray-700'>
//             <h2 className='text-lg font-semibold'>Nouveau message</h2>
//             <button onClick={onClose}>
//               <X className='h-5 w-5 text-gray-400 hover:text-white' />
//             </button>
//           </div>

//           <Tabs defaultValue='users' className='w-full'>
//             <TabsList className='grid w-full grid-cols-2'>
//               <TabsTrigger value='users'>Utilisateurs</TabsTrigger>
//               <TabsTrigger value='groups'>Groupes</TabsTrigger>
//             </TabsList>
//             <TabsContent value='users'>
//               <div className='px-4 py-3'>
//                 <div className='relative'>
//                   <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
//                   <input type='text' placeholder='Rechercher des utilisateurs...' value={search} onChange={(e) => setSearch(e.target.value)} className='w-full pl-10 pr-3 py-2 rounded-md bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500' />
//                 </div>
//                 <div className='mt-4 space-y-2'>
//                   {/* User list placeholder */}
//                   <div className='p-3 rounded-lg hover:bg-neutral-800 cursor-pointer'>
//                     {/* <div className='font-medium'>User 1</div>
//                     <div className='text-sm text-gray-400'>@username1</div> */}
//                   </div>
//                 </div>
//               </div>
//             </TabsContent>
//             <TabsContent value='groups'>
//               <div className='px-4 py-3'>
//                 <div className='relative'>
//                   <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
//                   <input type='text' placeholder='Rechercher des groupes...' className='w-full pl-10 pr-3 py-2 rounded-md bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500' />
//                 </div>
//                 <div className='mt-4 space-y-2'>
//                   {/* Groups list placeholder */}
//                   <div className='p-3 rounded-lg hover:bg-neutral-800 cursor-pointer'>
//                     {/* <div className='font-medium'>Group 1</div>
//                     <div className='text-sm text-gray-400'>10 membres</div> */}
//                   </div>
//                 </div>
//               </div>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// }

// const Tabs = TabsPrimitive.Root;

// const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => <TabsPrimitive.List ref={ref} className={cn('border-b border-gray-700', className)} {...props} />);
// TabsList.displayName = TabsPrimitive.List.displayName;

// const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, ...props }, ref) => <TabsPrimitive.Trigger ref={ref} className={cn('px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors', 'data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500', className)} {...props} />);
// TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={cn('mt-2', className)} {...props} />);
// TabsContent.displayName = TabsPrimitive.Content.displayName;

// export { Tabs, TabsList, TabsTrigger, TabsContent };
