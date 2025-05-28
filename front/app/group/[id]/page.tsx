"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/MainLayout";
import { HeaderGroup } from "@/components/groupComponent/groupInfoComponent/header-group";
import { EventGroup } from "@/components/groupComponent/groupInfoComponent/event-group";
import { PostGroup } from "@/components/groupComponent/groupInfoComponent/post-group";
import { GroupChat } from "@/components/groupComponent/groupInfoComponent/group-chat";

interface GroupApiResponse {
    group_infos: {
        id: string;
        name: string;
        description: string;
        group_pic_url: string;
        created_at: string;
    };
    total_members: number;
    is_member: boolean;
    is_admin: boolean;
    is_waiting: boolean;
}

export default function GroupPage() {
    const params = useParams();
    const groupId = params.id as string;

    const [data, setData] = useState<GroupApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost/api/group/info?groupId=${groupId}`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch group");
                const data: GroupApiResponse = await res.json();
                setData(data);
            } catch (err) {
                console.error(err);
                setError("Group not found or server error.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [groupId]);

    if (loading) return <p className="p-6">Loading...</p>;
    if (error || !data) return <p className="p-6 text-red-600">{error}</p>;

    return (
        <MainLayout>
            <section className="overflow-y-auto">
                <HeaderGroup data={data} />
                {data.is_member && (
                    <div className="space-y-6 p-4">
                        <EventGroup groupId={groupId} />
                        <GroupChat 
                            groupId={groupId} 
                            isAdmin={data.is_admin} 
                            isMember={data.is_member} 
                        />
                        <PostGroup groupId={groupId} />
                    </div>
                )}
            </section>
        </MainLayout>
    );
}