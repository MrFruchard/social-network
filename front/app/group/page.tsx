'use client';

import { useEffect, useState } from "react";
import { MainLayout } from '@/components/MainLayout';
import { ListOfGroups } from '@/components/groupComponent/list-of-groups';
import { CreateGroup } from "@/components/groupComponent/create-group";

// Le type Group peut être déplacé dans un fichier commun si tu préfères
interface Group {
    id: string;
    name: string;
    group_pic_url: string;
    created_at: string;
}

export default function Groups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchGroups = async () => {
        try {
            const res = await fetch("http://localhost/api/groups", {
                credentials: "include",
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                setGroups(data);
            } else if (data === null) {
                setGroups([]);
            } else if (Array.isArray(data.groups)) {
                setGroups(data.groups);
            } else {
                throw new Error("Format de données invalide");
            }
            setError(null);
        } catch (err) {
            console.error("Erreur lors du fetch des groupes :", err);
            setError("Impossible de charger les groupes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <MainLayout>
            <CreateGroup onCreateSuccess={fetchGroups} />
            <ListOfGroups groups={groups} loading={loading} error={error} />
        </MainLayout>
    );
}