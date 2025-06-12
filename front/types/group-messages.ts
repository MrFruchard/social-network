export interface GroupMessage {
    id: string;
    group_id: string;
    sender_id: string;
    content: string;
    type: number; // 0 = text, 1 = image
    created_at: string;
    sender: {
        id: string;
        username: string;
        firstname: string;
        lastname: string;
        profilePic?: string;
    };
}

export interface GroupMessageState {
    messages: GroupMessage[];
    loading: boolean;
    error: string | null;
}

export interface SendGroupMessageParams {
    groupId: string;
    content?: string;
    imageFile?: File;
}